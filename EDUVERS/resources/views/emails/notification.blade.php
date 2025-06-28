<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $notification->title }}</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
        }

        .header {
            background: linear-gradient(135deg, #b8860b 0%, #d4a574 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }

        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            position: relative;
            z-index: 1;
        }

        .header p {
            margin: 8px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }

        .content {
            padding: 40px 30px;
        }

        .notification-type {
            display: inline-block;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 25px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .type-info {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1e40af;
        }

        .type-warning {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            color: #d97706;
        }

        .type-success {
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            color: #059669;
        }

        .type-error {
            background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
            color: #dc2626;
        }

        .type-user {
            background: linear-gradient(135deg, #e9d5ff 0%, #c4b5fd 100%);
            color: #7c3aed;
        }

        .type-course {
            background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
            color: #3730a3;
        }

        .type-task {
            background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%);
            color: #0f766e;
        }

        .welcome-section {
            background: linear-gradient(135deg, #fef7e0 0%, #fef3c7 100%);
            border-radius: 16px;
            padding: 30px;
            margin: 25px 0;
            border: 1px solid #fbbf24;
            position: relative;
            overflow: hidden;
        }

        .welcome-section::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
        }

        @keyframes float {

            0%,
            100% {
                transform: translateY(0px) rotate(0deg);
            }

            50% {
                transform: translateY(-20px) rotate(180deg);
            }
        }

        .welcome-section h2 {
            margin: 0 0 15px 0;
            font-size: 24px;
            font-weight: 700;
            color: #92400e;
            position: relative;
            z-index: 1;
        }

        .welcome-section p {
            margin: 0 0 20px 0;
            color: #78350f;
            font-size: 16px;
            line-height: 1.6;
            position: relative;
            z-index: 1;
        }

        .features-list {
            list-style: none;
            padding: 0;
            margin: 20px 0;
            position: relative;
            z-index: 1;
        }

        .features-list li {
            padding: 8px 0;
            color: #78350f;
            font-size: 15px;
            position: relative;
            padding-left: 25px;
        }

        .features-list li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #b8860b;
            font-weight: 700;
            font-size: 16px;
        }

        .message {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-left: 4px solid #b8860b;
            padding: 25px;
            margin: 25px 0;
            border-radius: 0 12px 12px 0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .message p {
            margin: 0;
            color: #374151;
            font-size: 16px;
            line-height: 1.6;
        }

        .button-container {
            text-align: center;
            margin: 30px 0;
        }

        .button {
            display: inline-block;
            background: linear-gradient(135deg, #b8860b 0%, #d4a574 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 8px 20px rgba(184, 134, 11, 0.3);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .button:hover::before {
            left: 100%;
        }

        .button:hover {
            background: linear-gradient(135deg, #a67c0a 0%, #c19a6b 100%);
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(184, 134, 11, 0.4);
        }

        .timestamp {
            color: #6b7280;
            font-size: 14px;
            margin-top: 30px;
            text-align: center;
            padding: 20px;
            background: #f9fafb;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
        }

        .footer {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }

        .footer p {
            margin: 8px 0;
            color: #6b7280;
            font-size: 14px;
        }

        .footer .brand {
            font-weight: 700;
            color: #b8860b;
            font-size: 18px;
            margin-bottom: 10px;
        }

        .footer .support {
            color: #374151;
            font-weight: 600;
        }

        .footer .support a {
            color: #b8860b;
            text-decoration: none;
            font-weight: 700;
        }

        .footer .support a:hover {
            text-decoration: underline;
        }

        /* Responsive Design */
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 16px;
            }

            .header {
                padding: 30px 20px;
            }

            .header h1 {
                font-size: 24px;
            }

            .content {
                padding: 30px 20px;
            }

            .welcome-section {
                padding: 20px;
            }

            .button {
                padding: 14px 28px;
                font-size: 15px;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>EduVerse Platform</h1>
            <p>Your Gateway to Educational Excellence</p>
        </div>

        <div class="content">
            @if(str_contains(strtolower($notification->title), 'welcome'))
            <div class="notification-type type-success">
                🎉 Welcome to EduVerse
            </div>

            <div class="welcome-section">
                <h2>Welcome to Your Learning Journey!</h2>
                <p>Dear {{ $user->name }},</p>
                <p>Congratulations! Your EduVerse account has been successfully created and is ready for use. You're now part of a community dedicated to educational excellence and continuous learning.</p>

                <p><strong>Here's what you can do next:</strong></p>
                <ul class="features-list">
                    <li>Complete your profile information to personalize your experience</li>
                    <li>Browse our extensive collection of courses and learning materials</li>
                    <li>Take the placement test to get personalized course recommendations</li>
                    <li>Connect with other learners and educators in our community</li>
                    <li>Track your progress and celebrate your achievements</li>
                </ul>
            </div>

            <div class="button-container">
                <a href="{{ config('app.url') }}/dashboard" class="button">
                    🚀 Access Your Dashboard
                </a>
            </div>

            <p style="text-align: center; color: #6b7280; font-size: 15px; margin-top: 20px;">
                Ready to start your educational journey? Click the button above to access your personalized dashboard.
            </p>
            @else
            <div class="notification-type type-{{ $notification->type }}">
                {{ ucfirst($notification->type) }}
            </div>

            <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1f2937;">{{ $notification->title }}</h2>

            <div class="message">
                <p>{{ $notification->message }}</p>
            </div>

            <p style="margin: 20px 0; color: #4b5563; font-size: 16px;">
                Hello {{ $user->name }},
            </p>

            <p style="margin: 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                You have received a new notification from EduVerse. Please review the details above and take any necessary action.
            </p>

            <div class="button-container">
                <a href="{{ config('app.url') }}/dashboard" class="button">
                    📊 View Dashboard
                </a>
            </div>
            @endif

            <div class="timestamp">
                📅 Sent on {{ $notification->created_at->format('F j, Y \a\t g:i A') }}
            </div>
        </div>

        <div class="footer">
            <p class="brand">EduVerse</p>
            <p>Empowering Education Through Technology</p>
            <p class="support">
                Need help? Contact our support team at
                <a href="mailto:ba.eduverse@gmail.com">ba.eduverse@gmail.com</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
                This email was sent to {{ $user->email }}. If you have any questions, please don't hesitate to reach out.
            </p>
        </div>
    </div>
</body>

</html>