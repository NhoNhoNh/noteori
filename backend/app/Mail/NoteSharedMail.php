<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NoteSharedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $ownerName,
        public string $noteTitle,
        public string $permission,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "{$this->ownerName} đã chia sẻ một ghi chú với bạn - Noteori",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.note-shared',
        );
    }
}
