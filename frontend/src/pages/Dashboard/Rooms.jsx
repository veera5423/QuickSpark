import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, FolderKanban, Grid2X2, Link2, Plus, Search, Users } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { createRoom, getRooms, getRoomInviteLink } from '../../api/roomsAPI';
import { useAuth } from '../../context/AuthContext';

const emptyForm = {
  name: '',
  subject: '',
  description: '',
  passkey: '',
  ownerEmail: ''
};

const Rooms = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [copiedRoomId, setCopiedRoomId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const data = await getRooms();
      if (isMounted) setRooms(data);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRooms = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return rooms;

    return rooms.filter((room) =>
      [room.name, room.subject, room.description, room.owner?.name]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    );
  }, [rooms, searchQuery]);

  const totals = useMemo(() => {
    return rooms.reduce(
      (accumulator, room) => {
        accumulator.members += room.members?.length || 0;
        accumulator.folders += room.folders?.length || 0;
        accumulator.resources += room.folders?.reduce((folderTotal, folder) => folderTotal + (folder.resources?.length || 0), 0) || 0;
        return accumulator;
      },
      { rooms: rooms.length, members: 0, folders: 0, resources: 0 }
    );
  }, [rooms]);

  const refreshRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setRooms([]);
    }
  };

  const handleCreateRoom = (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.subject.trim()) return;

    createRoom({
      name: formData.name.trim(),
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      passkey: formData.passkey.trim(),
      ownerName: user?.username || 'Room Owner',
      ownerEmail: formData.ownerEmail.trim() || user?.email || ''
    });

    setFormData(emptyForm);
    refreshRooms();
  };

  const handleCopyInvite = async (roomId) => {
    const room = rooms.find((item) => item.id === roomId);
    if (!room) return;

    const link = getRoomInviteLink(roomId, room.invites?.[0]?.token || '');
    await navigator.clipboard.writeText(link);
    setCopiedRoomId(roomId);
    window.setTimeout(() => setCopiedRoomId(null), 1500);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-[2rem] bg-[linear-gradient(135deg,_#0f172a_0%,_#0f766e_55%,_#14b8a6_100%)] text-white p-6 md:p-8 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_white_0,_transparent_35%),radial-gradient(circle_at_bottom_left,_white_0,_transparent_30%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-teal-100">Study collaboration</p>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">Rooms</h1>
            <p className="text-teal-50/90 text-sm md:text-base leading-relaxed">
              Create private study rooms, organize folders by exam or subject, share invite links, and keep all your notes and questions together.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-slate-950">
            <div className="rounded-2xl bg-white/90 backdrop-blur p-4 shadow-lg min-w-[130px]">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Rooms</div>
              <div className="mt-1 text-2xl font-black">{totals.rooms}</div>
            </div>
            <div className="rounded-2xl bg-white/90 backdrop-blur p-4 shadow-lg min-w-[130px]">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Members</div>
              <div className="mt-1 text-2xl font-black">{totals.members}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Study rooms', value: totals.rooms, icon: Grid2X2 },
          { label: 'Members', value: totals.members, icon: Users },
          { label: 'Folders', value: totals.folders, icon: FolderKanban },
          { label: 'Resources', value: totals.resources, icon: Link2 }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} border className="border-slate-200/80">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-1 text-3xl font-black text-slate-950">{item.value}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card border className="border-slate-200/80 shadow-lg h-fit">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-black text-slate-950">Create room</h2>
              <p className="text-sm text-slate-500 mt-1">Set up a study space and keep the first invite link ready.</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleCreateRoom}>
            <Input
              label="Room name"
              placeholder="Organic Chemistry Squad"
              value={formData.name}
              onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
            />
            <Input
              label="Subject"
              placeholder="Chemistry, Physics, Exam Prep"
              value={formData.subject}
              onChange={(event) => setFormData((current) => ({ ...current, subject: event.target.value }))}
            />
            <Input
              label="Owner email"
              type="email"
              placeholder="you@example.com"
              value={formData.ownerEmail}
              onChange={(event) => setFormData((current) => ({ ...current, ownerEmail: event.target.value }))}
            />
            <Input
              label="Passkey"
              placeholder="Optional room code"
              value={formData.passkey}
              onChange={(event) => setFormData((current) => ({ ...current, passkey: event.target.value }))}
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea
                rows="4"
                placeholder="What is this room for?"
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white">
              Create room
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">Your rooms</h2>
              <p className="text-slate-500 mt-1">Open a room to manage folders, resources, chat, and invites.</p>
            </div>

            <div className="w-full md:w-80 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search rooms..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {filteredRooms.map((room) => {
              const folderCount = room.folders?.length || 0;
              const resourceCount = room.folders?.reduce((total, folder) => total + (folder.resources?.length || 0), 0) || 0;
              const inviteCount = room.invites?.length || 0;

              return (
                <Card key={room.id} border hover className="border-slate-200/80 shadow-lg overflow-hidden">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-teal-600">{room.subject}</p>
                      <h3 className="mt-2 text-xl font-black text-slate-950">{room.name}</h3>
                      <p className="mt-2 text-sm text-slate-500 line-clamp-2">{room.description}</p>
                    </div>
                    <div className="rounded-2xl bg-teal-50 text-teal-700 px-3 py-2 text-xs font-semibold">
                      {room.visibility === 'private' ? 'Invite only' : 'Open'}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-slate-500 text-xs">Members</div>
                      <div className="mt-1 font-black text-slate-950">{room.members?.length || 0}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-slate-500 text-xs">Folders</div>
                      <div className="mt-1 font-black text-slate-950">{folderCount}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-slate-500 text-xs">Resources</div>
                      <div className="mt-1 font-black text-slate-950">{resourceCount}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-500">
                    <span>{inviteCount} invite{inviteCount === 1 ? '' : 's'} generated</span>
                    <span>Passkey: {room.passkey}</span>
                  </div>

                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => navigate(`/dashboard/rooms/${room.id}`)} className="flex-1">
                      Open room
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleCopyInvite(room.id)}
                      className="flex-1 gap-2 border-slate-300"
                    >
                      <Copy className="h-4 w-4" />
                      {copiedRoomId === room.id ? 'Copied' : 'Copy link'}
                    </Button>
                  </div>
                </Card>
              );
            })}

            {filteredRooms.length === 0 && (
              <Card border className="border-dashed border-slate-300 bg-slate-50 shadow-none lg:col-span-2">
                <div className="py-12 text-center max-w-xl mx-auto space-y-3">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                    <Grid2X2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-950">No matching rooms</h3>
                  <p className="text-slate-500">Try a different search or create a room for the subject you are working on.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
