<?php

namespace App\Events;

use App\Models\Note;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NoteUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Note $note;

    public function __construct(Note $note)
    {
        $this->note = $note;
    }

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('note.' . $this->note->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'note.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->note->id,
            'title' => $this->note->title,
            'content' => $this->note->content,
            'updated_at' => $this->note->updated_at->toISOString(),
            'updated_by' => auth()->id(),
        ];
    }
}
