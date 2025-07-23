@php
$brandColor = '#bfae9e';
$accentColor = '#a68a6d';
@endphp
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Your EduVerse Email Verification Code</title>
</head>

<body style="background: #f7f3ef; font-family: 'Nunito', 'Arial', sans-serif; color: #4A3F3F; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f7f3ef; padding: 0;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background: #fff; border-radius: 18px; box-shadow: 0 4px 32px rgba(191,174,158,0.10); margin: 32px auto; padding: 32px 24px; border: 1.5px solid {{ $brandColor }};">
                    <tr>
                        <td align="center" style="padding-bottom: 18px;">
                            <h1 style="color: {{ $accentColor }}; font-size: 2.1rem; font-weight: 900; margin: 0 0 8px 0; letter-spacing: -1px;">EduVerse Verification</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 18px;">
                            <p style="font-size: 1.1rem; margin: 0 0 12px 0;">Hi <span style="color: {{ $accentColor }}; font-weight: 700;">{{ $name }}</span>,</p>
                            <p style="font-size: 1.08rem; margin: 0 0 18px 0;">Thank you for registering with <b>EduVerse</b>! To complete your registration, please enter the following verification code:</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-bottom: 18px;">
                            <div style="display: inline-block; background: #f7f3ef; border-radius: 12px; border: 2.5px solid {{ $brandColor }}; padding: 18px 36px; font-size: 2.2rem; font-weight: 900; color: {{ $accentColor }}; letter-spacing: 10px; margin-bottom: 8px;">
                                {{ $code }}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 12px;">
                            <p style="font-size: 1.01rem; color: #7a6a6a; margin: 0 0 8px 0;">This code will expire in <b>1 minute</b>. If you did not request this, you can safely ignore this email.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-top: 18px;">
                            <p style="font-size: 1.08rem; color: {{ $accentColor }}; font-weight: 700; margin: 0;">Welcome to EduVerse! 🚀</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-top: 18px;">
                            <span style="font-size: 0.98rem; color: #bfae9e;">&copy; {{ date('Y') }} EduVerse. All rights reserved.</span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>