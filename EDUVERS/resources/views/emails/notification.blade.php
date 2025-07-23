@php
$brandColor = '#bfae9e';
$accentColor = '#a68a6d';
@endphp
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Welcome to EduVerse!</title>
</head>

<body style="background: #f7f3ef; font-family: 'Nunito', 'Arial', sans-serif; color: #4A3F3F; margin: 0; padding: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f7f3ef; padding: 0;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background: #fff; border-radius: 18px; box-shadow: 0 4px 32px rgba(191,174,158,0.10); margin: 32px auto; padding: 36px 28px; border: 1.5px solid {{ $brandColor }};">
                    <tr>
                        <td align="center" style="padding-bottom: 18px;">
                            <h1 style="color: {{ $accentColor }}; font-size: 2.3rem; font-weight: 900; margin: 0 0 8px 0; letter-spacing: -1px;">Welcome to EduVerse! 🎉</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 18px;">
                            <p style="font-size: 1.15rem; margin: 0 0 12px 0;">Hi <span style="color: {{ $accentColor }}; font-weight: 700;">{{ $user->name ?? 'there' }}</span>,</p>
                            <p style="font-size: 1.08rem; margin: 0 0 18px 0;">We're thrilled to have you join <b>EduVerse</b>! 🚀<br>Start exploring courses, connect with our community, and unlock your learning journey.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-bottom: 18px;">
                            <a href="{{ url('/') }}" style="display: inline-block; background: linear-gradient(90deg, #bfae9e 0%, #a68a6d 100%); color: #fff; font-weight: 800; font-size: 1.15rem; border-radius: 12px; padding: 16px 38px; text-decoration: none; box-shadow: 0 2px 12px #bfae9e22; margin-bottom: 8px;">Go to EduVerse</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 12px;">
                            <p style="font-size: 1.01rem; color: #7a6a6a; margin: 0 0 8px 0;">If you have any questions or need help, just reply to this email or visit our Help Center.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-top: 18px;">
                            <p style="font-size: 1.08rem; color: {{ $accentColor }}; font-weight: 700; margin: 0;">Happy learning! 🌟</p>
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