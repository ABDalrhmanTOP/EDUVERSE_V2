<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $name;
    public $code;

    /**
     * Create a new message instance.
     */
    public function __construct($name, $code)
    {
        $this->name = $name;
        $this->code = $code;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Your EduVerse Email Verification Code')
            ->view('emails.verification_code')
            ->with([
                'name' => $this->name,
                'code' => $this->code,
            ]);
    }
}
