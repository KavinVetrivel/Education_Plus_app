import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Note from "@/models/Note";
import { Editor } from "@/components/editor/editor";
import { redirect } from "next/navigation";

export default async function NotePage({ params }: { params: Promise<{ noteId: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { noteId } = await params;

  await connectDB();
  const note = await Note.findOne({ _id: noteId, userId: session.user.id }).lean();

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Oops! Note not found.</h1>
        <p className="text-slate-500 font-medium italic">"Maybe it was never written, or successfully forgotten."</p>
      </div>
    );
  }

  // Serialize with proper types for Client Component
  const serializedNote: any = {
    ...note,
    _id: (note as any)._id?.toString(),
    subjectId: (note as any).subjectId?.toString(),
    userId: (note as any).userId?.toString(),
    createdAt: (note as any).createdAt?.toISOString(),
    updatedAt: (note as any).updatedAt?.toISOString(),
  };

  return (
    <div className="min-h-screen">
      <Editor note={serializedNote} />
    </div>
  );
}
