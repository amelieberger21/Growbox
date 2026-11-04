export const COMMUNITY_KEY = "mycobox.community.v1";
export interface CommunityPost {
  id: string;
  name: string;
  text: string;
  createdAt: string;
  images: string[];
}
export function readPosts(): CommunityPost[] {
  const raw: unknown = JSON.parse(localStorage.getItem(COMMUNITY_KEY) ?? "[]");
  if (!Array.isArray(raw)) throw new Error("Ungültige gespeicherte Beiträge.");
  return raw.filter((post): post is CommunityPost => !!post && typeof post === "object" &&
    typeof post.id === "string" && typeof post.name === "string" && post.name.length <= 60 &&
    typeof post.text === "string" && post.text.length > 0 && post.text.length <= 2000 &&
    typeof post.createdAt === "string" && Number.isFinite(Date.parse(post.createdAt)) &&
    Array.isArray(post.images) && post.images.length <= 3 &&
    post.images.every((image: unknown) => typeof image === "string" && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(image)));
}
export function addPost(post: CommunityPost): CommunityPost[] {
  const posts = [post, ...readPosts()];
  localStorage.setItem(COMMUNITY_KEY, JSON.stringify(posts));
  return posts;
}
export function deletePost(id: string): CommunityPost[] {
  const posts = readPosts().filter(post => post.id !== id);
  localStorage.setItem(COMMUNITY_KEY, JSON.stringify(posts));
  return posts;
}
/** Decode and re-encode uploads to bound storage and remove embedded metadata. */
export async function preparePhoto(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024)
    throw new Error("Bitte JPEG, PNG oder WebP mit höchstens 5 MB pro Bild auswählen.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error("Bild konnte nicht gelesen werden.");
    const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Bild konnte nicht verarbeitet werden.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/jpeg", 0.75);
    if (!data.startsWith("data:image/jpeg;base64,") || data.length > 1_000_000)
      throw new Error("Dieses Bild ist zu groß. Bitte ein kleineres Bild auswählen.");
    return data;
  } finally { URL.revokeObjectURL(url); }
}
