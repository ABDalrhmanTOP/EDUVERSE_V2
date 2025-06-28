# Email Configuration Guide for EduVerse Notifications

## Current Status

Your email is currently set to `log` mode, which means emails are being logged to files instead of being sent.

## Option 1: Gmail Configuration (Recommended for Testing)

### Step 1: Prepare Gmail Account

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
    - Go to Google Account Settings
    - Security → 2-Step Verification → App passwords
    - Generate a new app password for "Mail"
    - Copy the 16-character password

### Step 2: Update .env File

Replace your current mail settings in `.env` with:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-character-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="EduVerse"
```

### Step 3: Test Email Configuration

```bash
# Test email sending
POST /api/admin/notifications/test-email
```

## Option 2: Mailtrap (Free Testing Service)

### Step 1: Create Mailtrap Account

1. Go to [mailtrap.io](https://mailtrap.io)
2. Sign up for free account
3. Create a new inbox
4. Go to inbox settings → SMTP Settings

### Step 2: Update .env File

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=notifications@eduverse.com
MAIL_FROM_NAME="EduVerse"
```

## Option 3: Keep Log Mode (For Development)

If you want to keep emails logged instead of sent:

```env
MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="notifications@eduverse.com"
MAIL_FROM_NAME="EduVerse"
```

**To view logged emails:**

```bash
# Check Laravel logs
tail -f storage/logs/laravel.log
```

## Option 4: Outlook/Hotmail Configuration

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USERNAME=your-email@outlook.com
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@outlook.com
MAIL_FROM_NAME="EduVerse"
```

## Testing Email Configuration

### 1. Test Basic Email

```bash
POST /api/admin/notifications/test-email
```

### 2. Test User Welcome Email

```bash
# Register a new user
POST /api/register
{
  "name": "Test User",
  "username": "testuser",
  "email": "your-test-email@gmail.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

### 3. Test Course Notification Email

```bash
# Create a course (this will send emails to all users)
POST /api/admin/courses
{
  "video_id": "test12345678",
  "name": "Test Course",
  "description": "Test course description",
  "year": 1,
  "semester": 1
}
```

## Troubleshooting

### Issue 1: "Authentication failed"

**Solution**:

-   Check your email/password
-   For Gmail: Use app password, not regular password
-   Enable "Less secure app access" (not recommended)

### Issue 2: "Connection timeout"

**Solution**:

-   Check your internet connection
-   Verify SMTP host and port
-   Check firewall settings

### Issue 3: "Email not received"

**Solution**:

-   Check spam folder
-   Verify email address is correct
-   Check email provider settings

### Issue 4: Laravel Mail Error

**Solution**:

```bash
# Clear config cache
php artisan config:clear

# Clear cache
php artisan cache:clear

# Restart Laravel server
php artisan serve
```

## Email Templates

The notification emails use the following template:

-   **File**: `resources/views/emails/notification.blade.php`
-   **Subject**: Based on notification type
-   **Content**: Notification title and message

## Security Notes

1. **Never commit email passwords to git**
2. **Use environment variables for sensitive data**
3. **Use app passwords for Gmail**
4. **Consider using email services like SendGrid for production**

## Production Recommendations

For production, consider:

1. **SendGrid** - Professional email service
2. **Mailgun** - Reliable email delivery
3. **Amazon SES** - Cost-effective for high volume
4. **Postmark** - Transactional email specialist

## Quick Setup Commands

```bash
# Clear all caches after changing email config
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Restart server
php artisan serve
```
