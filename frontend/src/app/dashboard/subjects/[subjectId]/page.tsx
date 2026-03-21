import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Subject from "@/models/Subject";
import Note from "@/models/Note";
import { NotesList } from "./notes-list";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default async function SubjectDetailPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();
  const { subjectId } = await params;

  const subject = await Subject.findOne({ _id: subjectId, userId: session.user.id }).lean();

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-slate-800">Subject not found</h2>
        <Link href="/dashboard/subjects" className="mt-4 text-indigo-600 hover:underline">
          Return to your subjects
        </Link>
      </div>
    );
  }

  const notes = await Note.find({ subjectId, userId: session.user.id })
    .sort({ updatedAt: -1 })
    .lean();

  const serializedNotes = notes.map(n => ({
    _id: n._id.toString(),
    title: (n as any).title,
    content: (n as any).content,
    updatedAt: (n as any).updatedAt?.toISOString()
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <Link href="/dashboard/subjects" className="flex items-center text-sm font-medium text-muted-foreground hover:text-indigo-600 transition-colors">
            <ChevronLeft size={16} className="mr-1" /> Back to Subjects
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-4 h-12 rounded-full" style={{ backgroundColor: subject.color }} />
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{subject.name}</h1>
              <p className="text-muted-foreground max-w-2xl">{subject.description || "Collection of your study notes and materials."}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Subject</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete Subject</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Your Notes ({notes.length})</h2>
        </div>
        <NotesList notes={serializedNotes} subjectId={subjectId} />
      </div>
    </div>
  );
}
