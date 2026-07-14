import axiosClient from "./axiosClient";

const getInviteLink = (roomId, token) => {
  if (typeof window === "undefined") return `#room/${roomId}?invite=${token}`;
  return `${window.location.origin}/dashboard/rooms/${roomId}?invite=${token}`;
};

const normalizeMember = (member) => {
  if (!member) return null;
  return {
    id: member.user_id || member.id || member._id,
    name: member.name || "",
    email: member.email || "",
    role: member.role || "member",
    status: member.status || "active",
  };
};

const normalizeResource = (resource) => {
  if (!resource) return null;
  return {
    id: resource.resource_id || resource.id || resource._id,
    title: resource.title || "",
    kind: resource.kind || "pdf",
    url: resource.url || "",
    fileName: resource.file_name || resource.fileName || "",
    fileSizeLabel: resource.file_size_label || resource.fileSizeLabel || "",
    notes: resource.notes || "",
    addedAt: resource.added_at || resource.addedAt,
  };
};

const normalizeFolder = (folder) => {
  if (!folder) return null;
  return {
    id: folder.folder_id || folder.id || folder._id,
    name: folder.name || "",
    description: folder.description || "",
    parentFolderId: folder.parent_folder_id ?? folder.parentFolderId ?? null,
    createdAt: folder.created_at || folder.createdAt,
    updatedAt: folder.updated_at || folder.updatedAt,
    resources: (folder.resources || []).map(normalizeResource).filter(Boolean),
  };
};

const normalizeChatMessage = (message) => {
  if (!message) return null;
  return {
    id: message.message_id || message.id || message._id,
    author: message.author || "",
    role: message.role || "member",
    content: message.content || "",
    createdAt: message.created_at || message.createdAt,
  };
};

const normalizeInvite = (invite) => {
  if (!invite) return null;
  const token = invite.token || "";
  return {
    id: invite.invite_id || invite.id || invite._id,
    email: invite.email || "",
    name: invite.name || "",
    token,
    status: invite.status || "pending",
    createdAt: invite.created_at || invite.createdAt,
    joinLink: invite.join_link || invite.joinLink || (token ? getInviteLink(invite.room_id, token) : ""),
    invitedBy: invite.invited_by || invite.invitedBy,
  };
};

const normalizeRoom = (room) => {
  if (!room) return null;

  const normalized = {
    id: room.id || room.room_id || room._id,
    name: room.name || "",
    subject: room.subject || "",
    description: room.description || "",
    passkey: room.passkey || room.room_code || "",
    visibility: room.visibility || "private",

    owner: room.owner
      ? {
          id: room.owner.user_id || room.owner.id,
          name: room.owner.name || "",
          email: room.owner.email || "",
          role: room.owner.role || "owner",
        }
      : null,

    members: (room.members || []).map(normalizeMember).filter(Boolean),
    folders: (room.folders || []).map(normalizeFolder).filter(Boolean),
    chat: (room.chat || []).map(normalizeChatMessage).filter(Boolean),
    invites: (room.invites || []).map((i) => normalizeInvite(i)).filter(Boolean),

    createdAt: room.created_at || room.createdAt,
    updatedAt: room.updated_at || room.updatedAt,

    // Backend field is share_token; UI uses shareToken / inviteCode opportunistically.
    shareToken: room.share_token || room.shareToken,
    inviteCode: room.invite_code || room.inviteCode,
  };

  // Ensure folders’ resource ids exist (backend uses resources embedded)
  normalized.folders = normalized.folders.map((f) => ({
    ...f,
    resources: (f.resources || []).map((r) => ({ ...r })),
  }));

  return normalized;
};

const handleApiError = (error, fallback) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.message || 'Request failed';
  console.error('[RoomsAPI]', { status, message });
  return fallback;
};

export const getRooms = async () => {
  try {
    const res = await axiosClient.get('/api/rooms/');
    // backend returns { rooms: [...] }
    const rooms = res.data?.rooms || [];
    return rooms
      .map(normalizeRoom)
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } catch (error) {
    return handleApiError(error, []);
  }
};

export const getRoom = async (roomId, { inviteToken = "" } = {}) => {
  try {
    const url = inviteToken ? `/api/rooms/${roomId}?invite=${encodeURIComponent(inviteToken)}` : `/api/rooms/${roomId}`;
    const res = await axiosClient.get(url);
    return normalizeRoom(res.data?.room);
  } catch (error) {
    console.error('[RoomsAPI] getRoom failed', error?.response?.data || error?.message);
    return null;
  }
};

export const createRoom = async ({ name, subject, description, passkey, visibility = "private", ownerName, ownerEmail }) => {
  const payload = {
    name,
    subject,
    description,
    // Backend expects passkey optional; if empty, it generates.
    passkey: passkey || undefined,
    visibility,
    // owner fields are not used by backend; it reads owner from JWT user.
    owner_name: ownerName,
    owner_email: ownerEmail,
  };

  const res = await axiosClient.post("/api/rooms/", payload);
  return normalizeRoom(res.data?.room);
};

export const createFolder = async (roomId, { name, description = "", parentFolderId = null }) => {
  const payload = {
    name,
    description,
    parent_folder_id: parentFolderId || null,
  };

  await axiosClient.post(`/api/rooms/${roomId}/folders`, payload);
  return true;
};

export const addResource = async (roomId, folderId, resource) => {
  const payload = {
    folder_id: folderId,
    title: resource.title,
    kind: resource.kind,
    url: resource.kind === "link" ? resource.url : undefined,
    file_name: resource.kind === "pdf" ? resource.fileName : undefined,
    file_size_label: resource.kind === "pdf" ? resource.fileSizeLabel : undefined,
    notes: resource.notes,
  };

  await axiosClient.post(`/api/rooms/${roomId}/resources`, payload);
  return true;
};

export const addMessage = async (roomId, { author, role, content }) => {
  await axiosClient.post(`/api/rooms/${roomId}/messages`, { content });
  return true;
};

export const createInvites = async (roomId, emails, inviterName) => {
  const payload = { emails };
  const res = await axiosClient.post(`/api/rooms/${roomId}/invites`, payload);
  return {
    invites: (res.data?.invites || []).map(normalizeInvite).filter(Boolean),
    failed_emails: res.data?.failed_emails || [],
  };
};

export const getRoomInviteLink = (roomId, inviteToken = "") => {
  if (inviteToken) return getInviteLink(roomId, inviteToken);
  // fallback: if no token, still generate a stable invite url using roomId as a dummy token
  return getInviteLink(roomId, roomId);
};

