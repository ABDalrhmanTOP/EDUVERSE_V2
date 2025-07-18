<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo e($notification->title); ?></title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header {
            background: linear-gradient(135deg, #b8860b 0%, #d4a574 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }

        .content {
            padding: 30px;
        }

        .notification-type {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 20px;
        }

        .type-info {
            background-color: #dbeafe;
            color: #1e40af;
        }

        .type-warning {
            background-color: #fef3c7;
            color: #d97706;
        }

        .type-success {
            background-color: #d1fae5;
            color: #059669;
        }

        .type-error {
            background-color: #fee2e2;
            color: #dc2626;
        }

        .type-user {
            background-color: #e9d5ff;
            color: #7c3aed;
        }

        .type-course {
            background-color: #e0e7ff;
            color: #3730a3;
        }

        .type-task {
            background-color: #ccfbf1;
            color: #0f766e;
        }

        .message {
            background-color: #f8f9fa;
            border-left: 4px solid #b8860b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }

        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }

        .footer p {
            margin: 5px 0;
            color: #6c757d;
            font-size: 14px;
        }

        .button {
            display: inline-block;
            background: linear-gradient(135deg, #b8860b 0%, #d4a574 100%);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }

        .button:hover {
            background: linear-gradient(135deg, #a67c0a 0%, #c19a6b 100%);
        }

        .timestamp {
            color: #6c757d;
            font-size: 12px;
            margin-top: 20px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>EduVerse Notification</h1>
        </div>

        <div class="content">
            <div class="notification-type type-<?php echo e($notification->type); ?>">
                <?php echo e(ucfirst($notification->type)); ?>

            </div>

            <h2><?php echo e($notification->title); ?></h2>

            <div class="message">
                <p><?php echo e($notification->message); ?></p>
            </div>

            <p>Hello <?php echo e($user->name); ?>,</p>

            <p>You have received a new notification from EduVerse. Please review the details above.</p>

            <div style="text-align: center;">
                <a href="<?php echo e(config('app.url')); ?>/AdminDashboard" class="button">
                    View Dashboard
                </a>
            </div>

            <div class="timestamp">
                Sent on <?php echo e($notification->created_at->format('F j, Y \a\t g:i A')); ?>

            </div>
        </div>

        <div class="footer">
            <p><strong>EduVerse</strong></p>
            <p>Your educational platform</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>

</html><?php /**PATH B:\EDUVERSE_V2\EDUVERS\resources\views/emails/notification.blade.php ENDPATH**/ ?>