import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Copy, FolderKanban, Link2, Mail, MessageSquare, Paperclip, Plus, Send, Shield, Users, Video } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { addMessage, addResource, createFolder, createInvites, getRoom, getRoomInviteLink } from '../../api/roomsAPI';


const formatBytes = (bytes) => {
  if (!bytes || isNaN(bytes)) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};




const tabs = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'folders', label: 'Folders', icon: FolderKanban },
  { id: 'resources', label: 'Resources', icon: Paperclip },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'invite', label: 'Invite', icon: Mail }
];

const emptyFolderForm = {
  name: '',
  description: '',
  parentFolderId: ''
};

const emptyResourceForm = {
  folderId: '',
  title: '',
  kind: 'pdf',
  url: '',
  notes: ''
};

const RoomWorkspace = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const [room, setRoom] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [folderForm, setFolderForm] = useState(emptyFolderForm);
  const [resourceForm, setResourceForm] = useState(emptyResourceForm);
  const [inviteEmails, setInviteEmails] = useState('');
  const [chatDraft, setChatDraft] = useState('');
  const [copiedText, setCopiedText] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [uiMessage, setUiMessage] = useState(null);


  const inviteToken = searchParams.get('invite');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const data = await getRoom(roomId, { inviteToken });
      if (isMounted) setRoom(data);
    })();

    return () => {
      isMounted = false;
    };
  }, [roomId, inviteToken]);

  // If user opened an invite link and is authenticated, mark invite as accepted.
  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!inviteToken) return;
      // Must be logged in to join (JWT required)
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // backend endpoint: POST /api/rooms/<room_id>/join with { invite_token }
        // reuse getRoom's refresh flow after join
        // eslint-disable-next-line no-unused-vars
        const joinRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/rooms/${roomId}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ invite_token: inviteToken }),
        });

        if (!joinRes.ok) {
          // joining is optional; don't hard crash the page
          return;
        }

        const refreshed = await getRoom(roomId, { inviteToken });
        if (isMounted) setRoom(refreshed);
        setUiMessage({ type: 'success', text: 'Invite accepted.' });
        setTimeout(() => setUiMessage(null), 3000);
      } catch (e) {
        setUiMessage({ type: 'error', text: 'Failed to accept invite.' });
        setTimeout(() => setUiMessage(null), 4000);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [roomId, inviteToken]);


  useEffect(() => {

    if (room?.folders?.length && !selectedFolderId) {
      setSelectedFolderId(room.folders[0].id);
      setResourceForm((current) => ({ ...current, folderId: room.folders[0].id }));
    }
  }, [room, selectedFolderId]);

//   const inviteToken = searchParams.get('invite');

  const refreshRoom = async () => {
    const data = await getRoom(roomId);
    setRoom(data);
  };

  const folders = room?.folders || [];
  const rootFolders = useMemo(() => folders.filter((folder) => !folder.parentFolderId), [folders]);
  const childFolders = useMemo(() => folders.filter((folder) => folder.parentFolderId), [folders]);

  const roomStats = useMemo(() => {
    const resourceCount = folders.reduce((total, folder) => total + (folder.resources?.length || 0), 0);
    return {
      members: room?.members?.length || 0,
      folders: folders.length,
      resources: resourceCount,
      invites: room?.invites?.length || 0
    };
  }, [folders, room]);

  const handleCreateFolder = async (event) => {
    event.preventDefault();
    if (!folderForm.name.trim()) return;

    try {
      await createFolder(roomId, {
        name: folderForm.name.trim(),
        description: folderForm.description.trim(),
        parentFolderId: folderForm.parentFolderId || null,
      });
      await refreshRoom();
      setFolderForm(emptyFolderForm);
      setActiveTab('folders');
    } catch (error) {
      console.error('[RoomWorkspace] createFolder failed', error);
      await refreshRoom();
    }
  };

  const handleAddResource = async (event) => {
    event.preventDefault();
    if (!resourceForm.title.trim() || !resourceForm.folderId) return;

    try {
      await addResource(roomId, resourceForm.folderId, {
        title: resourceForm.title.trim(),
        kind: resourceForm.kind,
        url: resourceForm.kind === 'link' ? resourceForm.url.trim() : '',
        fileName: resourceForm.kind === 'pdf' ? resourceForm.title.trim() : '',
        notes: resourceForm.notes.trim(),
      });
      await refreshRoom();
      setResourceForm(emptyResourceForm);
      setUiMessage({ type: 'success', text: 'Resource added successfully.' });
      setTimeout(() => setUiMessage(null), 3000);
    } catch (error) {
      console.error('[RoomWorkspace] addResource failed', error);
      await refreshRoom();
      setUiMessage({ type: 'error', text: error?.response?.data?.message || error?.message || 'Failed to add resource.' });
      setTimeout(() => setUiMessage(null), 4000);
    }
  };

  const handleSendChat = async (event) => {
    event.preventDefault();
    if (!chatDraft.trim()) return;

    try {
      await addMessage(roomId, {
        author: room?.owner?.name || 'Room Owner',
        role: 'member',
        content: chatDraft.trim(),
      });
      await refreshRoom();
      setChatDraft('');
      setUiMessage({ type: 'success', text: 'Message sent.' });
      setTimeout(() => setUiMessage(null), 3000);
    } catch (error) {
      console.error('[RoomWorkspace] addMessage failed', error);
      setUiMessage({ type: 'error', text: error?.response?.data?.message || error?.message || 'Failed to send message.' });
      setTimeout(() => setUiMessage(null), 4000);
    }
  };

  const handleSendInvites = async (event) => {
    event.preventDefault();
    if (!inviteEmails.trim()) return;

    try {
      await createInvites(roomId, inviteEmails, room?.owner?.name || 'Room Owner');
      setInviteEmails('');
      await refreshRoom();
      setActiveTab('invite');
      setUiMessage({ type: 'success', text: 'Invites created successfully.' });
      setTimeout(() => setUiMessage(null), 3000);
    } catch (error) {
      console.error('[RoomWorkspace] createInvites failed', error);
      await refreshRoom();
      setUiMessage({ type: 'error', text: error?.response?.data?.message || error?.message || 'Failed to create invites.' });
      setTimeout(() => setUiMessage(null), 4000);
    }
  };

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopiedText(text);
    window.setTimeout(() => setCopiedText(''), 1500);
  };

  const handleCopyInviteLink = async () => {
    const token = room?.invites?.[0]?.token || '';
    await handleCopy(getRoomInviteLink(roomId, token));
  };

  if (!room) {
    return (
      <div className="space-y-4 p-6">
        <Card border className="border-slate-200/80">
          <div className="py-16 text-center max-w-lg mx-auto space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-950">Room not found</h1>
            <p className="text-slate-500">This room does not exist in the current browser session yet. Create a new one from the Rooms page.</p>
            <Button onClick={() => navigate('/dashboard/rooms')}>
              Back to rooms
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3 max-w-3xl">
          <Button variant="outline" onClick={() => navigate('/dashboard/rooms')} className="gap-2 border-slate-300 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to rooms
          </Button>
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-teal-600">Study room</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-black tracking-tight text-slate-950">{room.name}</h1>
            <p className="mt-3 text-slate-600 max-w-2xl">{room.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:w-auto">
          {[
            { label: 'Members', value: roomStats.members },
            { label: 'Folders', value: roomStats.folders },
            { label: 'Resources', value: roomStats.resources },
            { label: 'Invites', value: roomStats.invites }
          ].map((item) => (
            <Card key={item.label} border className="border-slate-200/80">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{item.value}</p>
            </Card>
          ))}
        </div>
      </div>

      {inviteToken && (
        <Card border className="border-teal-200 bg-teal-50/80 text-teal-950">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Invite detected</p>
              <p className="mt-1 text-sm">Someone opened a shared invite link for this room.</p>
            </div>
            <Button type="button" variant="outline" className="border-teal-300" onClick={handleCopyInviteLink}>
              {copiedText ? 'Copied' : 'Copy invite link'}
            </Button>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${isActive ? 'bg-slate-950 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-300 hover:text-slate-950'}`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
          <Card border className="border-slate-200/80 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">Room details</h2>
                <p className="text-sm text-slate-500 mt-1">Owner-controlled private study space with a passkey and invite links.</p>
              </div>
              <div className="rounded-2xl bg-slate-950 text-white px-3 py-2 text-sm font-semibold">Passkey: {room.passkey}</div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-500">Owner</div>
                <div className="mt-1 text-lg font-bold text-slate-950">{room.owner?.name}</div>
                <div className="text-sm text-slate-500">{room.owner?.email || 'No email saved yet'}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-500">Invite link</div>
                <div className="mt-1 break-all text-sm text-slate-700">{getRoomInviteLink(roomId, room.invites?.[0]?.token || '')}</div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 md:flex-row">
              <Button onClick={handleCopyInviteLink} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white">
                <Copy className="h-4 w-4" />
                Copy share link
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('invite')} className="gap-2 border-slate-300">
                <Mail className="h-4 w-4" />
                Invite members
              </Button>
            </div>
          </Card>

          <Card border className="border-slate-200/80 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">Members</h2>
                <p className="text-sm text-slate-500 mt-1">People currently connected to this room.</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {room.members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3">
                  <div>
                    <div className="font-semibold text-slate-950">{member.name}</div>
                    <div className="text-sm text-slate-500">{member.email}</div>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
                    {member.role}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-amber-950">
              <div className="flex items-center gap-2 font-semibold">
                <Video className="h-4 w-4" />
                Video room coming later
              </div>
              <p className="mt-2 text-sm text-amber-900/80">
                For now, the UI leaves space for a Zoom-style stage. When the backend is ready, this area can hold live call controls and participant tiles.
              </p>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'folders' && (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Card border className="border-slate-200/80 shadow-lg h-fit">
            <h2 className="text-xl font-black text-slate-950">Create folder</h2>
            <p className="mt-1 text-sm text-slate-500">Use folders for subjects, chapters, or exam buckets.</p>

            <form className="mt-5 space-y-4" onSubmit={handleCreateFolder}>
              <Input
                label="Folder name"
                placeholder="Chemistry - Chapter 1"
                value={folderForm.name}
                onChange={(event) => setFolderForm((current) => ({ ...current, name: event.target.value }))}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Parent folder</label>
                <select
                  value={folderForm.parentFolderId}
                  onChange={(event) => setFolderForm((current) => ({ ...current, parentFolderId: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">No parent</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  rows="4"
                  placeholder="What belongs in this folder?"
                  value={folderForm.description}
                  onChange={(event) => setFolderForm((current) => ({ ...current, description: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                Create folder
              </Button>
            </form>
          </Card>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {rootFolders.map((folder) => (
                <Card key={folder.id} border className="border-slate-200/80 shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-teal-600">Root folder</p>
                      <h3 className="mt-2 text-lg font-black text-slate-950">{folder.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{folder.description}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                      {folder.resources?.length || 0} items
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {childFolders.length > 0 && (
              <Card border className="border-slate-200/80 shadow-lg">
                <h3 className="text-lg font-black text-slate-950">Nested folders</h3>
                <div className="mt-4 space-y-3">
                  {childFolders.map((folder) => {
                    const parentFolder = folders.find((item) => item.id === folder.parentFolderId);
                    return (
                      <div key={folder.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                        <div>
                          <div className="font-semibold text-slate-950">{folder.name}</div>
                          <div className="text-sm text-slate-500">Parent: {parentFolder?.name || 'None'}</div>
                        </div>
                        <div className="text-sm font-semibold text-slate-600">{folder.resources?.length || 0} items</div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Card border className="border-slate-200/80 shadow-lg h-fit">
            <h2 className="text-xl font-black text-slate-950">Add resource</h2>
            <p className="mt-1 text-sm text-slate-500">Upload a PDF or attach an external link to a folder.</p>

            <form className="mt-5 space-y-4" onSubmit={handleAddResource}>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Folder</label>
                <select
                  value={resourceForm.folderId}
                  onChange={(event) => setResourceForm((current) => ({ ...current, folderId: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Choose a folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Resource title"
                placeholder="Magnetism notes"
                value={resourceForm.title}
                onChange={(event) => setResourceForm((current) => ({ ...current, title: event.target.value }))}
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Type</label>
                <select
                  value={resourceForm.kind}
                  onChange={(event) => setResourceForm((current) => ({ ...current, kind: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="pdf">PDF upload</option>
                  <option value="link">External link</option>
                </select>
              </div>

              {resourceForm.kind === 'link' && (
                <Input
                  label="URL"
                  placeholder="https://example.com/resource"
                  value={resourceForm.url}
                  onChange={(event) => setResourceForm((current) => ({ ...current, url: event.target.value }))}
                />
              )}

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  rows="4"
                  placeholder="Why should the room use this resource?"
                  value={resourceForm.notes}
                  onChange={(event) => setResourceForm((current) => ({ ...current, notes: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                Add resource
              </Button>

              {uiMessage && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-medium ${
                    uiMessage.type === 'success' ? 'bg-teal-50 text-teal-900 border border-teal-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  {uiMessage.text}
                </div>
              )}

            </form>
          </Card>

          <div className="space-y-4">
            {folders.map((folder) => (
              <Card key={folder.id} border className="border-slate-200/80 shadow-lg">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Folder</p>
                    <h3 className="mt-2 text-lg font-black text-slate-950">{folder.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{folder.description}</p>
                  </div>
                  <Button variant="outline" onClick={() => {
                    setSelectedFolderId(folder.id);
                    setResourceForm((current) => ({ ...current, folderId: folder.id }));
                    setActiveTab('resources');
                  }} className="border-slate-300 gap-2">
                    <Plus className="h-4 w-4" />
                    Add here
                  </Button>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {(folder.resources || []).map((resource) => (
                    <div key={resource.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-950">{resource.title}</div>
                          <div className="text-xs uppercase tracking-[0.18em] text-teal-600 mt-1">{resource.kind}</div>
                        </div>
                        <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                          {resource.kind === 'pdf' ? resource.fileSizeLabel || 'PDF' : 'Link'}
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{resource.notes}</p>
                      {resource.kind === 'link' && resource.url && (
                        <a href={resource.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800">
                          <Link2 className="h-4 w-4" />
                          Open link
                        </a>
                      )}
                    </div>
                  ))}

                  {(folder.resources || []).length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 md:col-span-2">
                      No resources yet. Add a PDF or external link to make this folder useful.
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {folders.length === 0 && (
              <Card border className="border-dashed border-slate-300 bg-slate-50 shadow-none">
                <div className="py-12 text-center text-slate-500">
                  Create a folder first, then start adding PDFs and links.
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
          <Card border className="border-slate-200/80 shadow-lg min-h-[520px] flex flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">Room chat</h2>
                <p className="text-sm text-slate-500 mt-1">Keep discussion inside the room so every member sees the same context.</p>
              </div>
              <div className="rounded-2xl bg-teal-50 text-teal-700 px-3 py-2 text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Live discussion
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto py-5">
              {room.chat?.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'owner' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xl rounded-2xl px-4 py-3 ${message.role === 'owner' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-800'}`}>
                    <div className="text-xs uppercase tracking-[0.18em] opacity-70">{message.author}</div>
                    <p className="mt-1 leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <form className="border-t border-slate-200 pt-4 flex flex-col gap-3 md:flex-row" onSubmit={handleSendChat}>
              <Input
                value={chatDraft}
                onChange={(event) => setChatDraft(event.target.value)}
                placeholder="Ask a doubt or share an update..."
                className="flex-1"
              />
              <Button type="submit" className="gap-2 bg-teal-600 hover:bg-teal-700 text-white">
                <Send className="h-4 w-4" />
                Send
              </Button>
            </form>
          </Card>

          <Card border className="border-slate-200/80 shadow-lg h-fit">
            <h3 className="text-lg font-black text-slate-950">Chat hints</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">Use chat for doubt solving, reminders, and quick file references.</div>
              <div className="rounded-2xl bg-slate-50 p-4">Later this panel can connect to real-time sockets and typing indicators.</div>
              <div className="rounded-2xl bg-slate-50 p-4">Video and screen share can live beside chat when you are ready to add calls.</div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'invite' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_360px]">
          <Card border className="border-slate-200/80 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">Invite members</h2>
                <p className="text-sm text-slate-500 mt-1">Send a link or prepare an email invite with the passkey.</p>
              </div>
              <div className="rounded-2xl bg-teal-50 text-teal-700 px-3 py-2 text-sm font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email invite
              </div>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSendInvites}>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Email addresses</label>
                <textarea
                  rows="4"
                  placeholder="friend1@example.com, friend2@example.com"
                  value={inviteEmails}
                  onChange={(event) => setInviteEmails(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-xs text-slate-500">Separate multiple emails with commas. The front end keeps the invite records for now.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card border className="border-slate-200/80 shadow-none bg-slate-50">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Passkey</div>
                      <div className="mt-1 text-lg font-black text-slate-950">{room.passkey}</div>
                    </div>
                    <Button type="button" variant="outline" onClick={() => handleCopy(room.passkey)} className="border-slate-300 px-3 py-2">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>

                <Card border className="border-slate-200/80 shadow-none bg-slate-50">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Room link</div>
                      <div className="mt-1 text-sm font-semibold text-slate-950 break-all">{getRoomInviteLink(roomId, room.invites?.[0]?.token || '')}</div>
                    </div>
                    <Button type="button" variant="outline" onClick={() => handleCopy(getRoomInviteLink(roomId, room.invites?.[0]?.token || ''))} className="border-slate-300 px-3 py-2">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                  <Mail className="h-4 w-4" />
                  Prepare email invites
                </Button>
                <Button type="button" variant="outline" onClick={() => handleCopy(room.passkey)} className="border-slate-300 gap-2">
                  <Copy className="h-4 w-4" />
                  {copiedText === room.passkey ? 'Copied' : 'Copy passkey'}
                </Button>
              </div>
            </form>
          </Card>

          <Card border className="border-slate-200/80 shadow-lg h-fit">
            <h3 className="text-lg font-black text-slate-950">Email preview</h3>
            <div className="mt-4 space-y-3 rounded-2xl bg-slate-950 p-4 text-slate-100">
              <div className="text-sm text-slate-300">Subject</div>
              <div className="font-semibold">Invitation to join {room.name}</div>
              <div className="text-sm text-slate-300 mt-3">Message</div>
              <p className="text-sm leading-relaxed text-slate-200">
                You have been invited to join {room.name} for {room.subject}. Use the room link below and the passkey to join the study space.
              </p>
              <div className="rounded-xl bg-white/10 p-3 text-sm break-all">{getRoomInviteLink(roomId, room.invites?.[0]?.token || '')}</div>
              <div className="rounded-xl bg-white/10 p-3 text-sm">Passkey: {room.passkey}</div>
            </div>
          </Card>

          <Card border className="border-slate-200/80 shadow-lg xl:col-span-2">
            <h3 className="text-lg font-black text-slate-950">Pending invites</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {room.invites?.map((invite) => (
                <div key={invite.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-950">{invite.email}</div>
                      <div className="text-sm text-slate-500">Invited by {invite.invitedBy || room.owner?.name}</div>
                    </div>
                    <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{invite.status}</div>
                  </div>
                  <div className="mt-3 text-xs text-slate-500 break-all">{invite.joinLink || getRoomInviteLink(roomId, invite.token)}</div>
                </div>
              ))}
              {(room.invites || []).length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 md:col-span-2">
                  No pending invites yet. Add a few emails above and the invite list will appear here.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RoomWorkspace;
