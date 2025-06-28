<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Notification;
use App\Models\User;

class NotificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $notification;
    public $user;

    /**
     * Create a new message instance.
     */
    public function __construct(Notification $notification, User $user)
    {
        $this->notification = $notification;
        $this->user = $user;

        // Don't queue this email for faster delivery
        $this->afterCommit();
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->notification->title;

        // Optimize subject line for welcome emails to avoid spam filters
        if (str_contains(strtolower($this->notification->title), 'welcome')) {
            $subject = 'EduVerse Account Confirmation - Welcome to Your Learning Journey';
        }

        return new Envelope(
            subject: $subject,
            tags: ['notification', 'eduverse'],
            metadata: [
                'notification_id' => $this->notification->id,
                'user_id' => $this->user->id,
                'notification_type' => $this->notification->type,
            ],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.notification',
            with: [
                'notification' => $this->notification,
                'user' => $this->user,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
