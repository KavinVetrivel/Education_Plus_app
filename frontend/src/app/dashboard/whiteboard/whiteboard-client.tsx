"use client";

import { Tldraw, createShapeId, Editor } from "tldraw";
import "tldraw/tldraw.css";
import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Users } from "lucide-react";

export function WhiteboardClient({ boardId }: { boardId: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [editor, setEditor] = useState<Editor | null>(null);
    const [connected, setConnected] = useState(false);
    const [peers, setPeers] = useState(0);

    const isRemoteChange = useRef(false);

    useEffect(() => {
        // Connect to FastAPI WebSocket
        const wsUrl = `ws://localhost:8000/ws/whiteboard/${boardId}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("Connected to Whiteboard WebSocket");
            setConnected(true);
        };

        ws.onmessage = (event) => {
            if (!editor) return;

            try {
                const data = JSON.parse(event.data);

                if (data.type === "update") {
                    isRemoteChange.current = true;
                    // Apply remote changes to editor
                    // For simplicity in this demo, we handle shapes
                    const { changes } = data;
                    editor.store.mergeRemoteChanges(() => {
                        if (changes.added) {
                            Object.values(changes.added).forEach((shape: any) => {
                                editor.createShapes([shape]);
                            });
                        }
                        if (changes.updated) {
                            Object.values(changes.updated).forEach((update: any) => {
                                const [from, to] = update;
                                editor.updateShapes([to]);
                            });
                        }
                        if (changes.removed) {
                            Object.keys(changes.removed).forEach((id: any) => {
                                editor.deleteShapes([id]);
                            });
                        }
                    });
                    isRemoteChange.current = false;
                }
            } catch (err) {
                console.error("WB WS error:", err);
            }
        };

        ws.onclose = () => {
            setConnected(false);
            console.log("Whiteboard WebSocket disconnected");
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, [boardId, editor]);

    // Track local changes and broadcast
    useEffect(() => {
        if (!editor || !socket || !connected) return;

        const cleanup = editor.store.listen((event) => {
            if (isRemoteChange.current) return;
            if (event.source !== "user") return;

            const { added, updated, removed } = event.changes;

            if (Object.keys(added).length || Object.keys(updated).length || Object.keys(removed).length) {
                socket.send(JSON.stringify({
                    type: "update",
                    changes: { added, updated, removed }
                }));
            }
        });

        return cleanup;
    }, [editor, socket, connected]);

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] relative">
            <div className="absolute top-4 right-4 z-[1000] flex items-center gap-3">
                <Card className="bg-white/80 backdrop-blur-md px-4 py-2 flex items-center gap-3 border-none shadow-lg rounded-2xl">
                    <div className={connected ? "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" : "w-2 h-2 rounded-full bg-rose-500"} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {connected ? "Live Sync Active" : "Offline"}
                    </span>
                </Card>
                <Card className="bg-white/80 backdrop-blur-md px-4 py-2 flex items-center gap-3 border-none shadow-lg rounded-2xl">
                    <Users size={14} className="text-indigo-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Collaborative Mode
                    </span>
                </Card>
            </div>

            {!connected && (
                <div className="absolute inset-0 z-[999] bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                    <Card className="p-8 rounded-[2rem] shadow-2xl border-none flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                        <p className="text-sm font-bold text-slate-500">Connecting to Sync Engine...</p>
                    </Card>
                </div>
            )}

            <div className="flex-1 rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl relative">
                <Tldraw
                    onMount={(editor) => setEditor(editor)}
                    persistenceKey={`eduplus_board_${boardId}`}
                />
            </div>
        </div>
    );
}
