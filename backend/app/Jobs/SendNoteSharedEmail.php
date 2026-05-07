<?php

namespace App\Jobs;

use App\Mail\NoteSharedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendNoteSharedEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public string $recipientEmail,
        public string $ownerName,
        public string $noteTitle,
        public string $permission,
    ) {}

    public function handle(): void
    {
        Mail::to($this->recipientEmail)->send(
            new NoteSharedMail($this->ownerName, $this->noteTitle, $this->permission)
        );
    }
}
