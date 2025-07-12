# CodeViz Research Context

> **Note**: This file contains research context from CodeViz. Most recent contexts are at the bottom.

---

## Research Query

pament

*Session: 168ef5caa3e5fdb1e767c41c9e1c302f | Generated: 7/10/2025, 12:39:30 AM*

### Analysis Summary

# Payment Processing in EDUVERS

This report details the payment processing mechanisms within the EDUVERS application, focusing on its integration with Stripe for handling subscriptions.

## High-Level Overview

The EDUVERS application integrates with **Stripe** to manage user subscriptions and process payments. The core flow involves a frontend component for user interaction and a backend API for secure payment intent creation, confirmation, and webhook handling.

## Backend Payment Processing (Laravel)

The backend, built with Laravel, handles the server-side logic for Stripe payments.

### **Stripe Controller**

The primary component for payment processing on the backend is the **StripeController** [StripeController](EDUVERS/app/Http/Controllers/StripeController.php).

*   **Purpose**: Manages the creation of payment intents, handles Stripe webhooks for successful or failed payments, and updates subscription statuses.
*   **Key Methods**:
    *   `createPaymentIntent(Request $request)` [createPaymentIntent](EDUVERS/app/Http/Controllers/StripeController.php:30): Creates a new Stripe Payment Intent for a subscription. This method logs the creation process and returns the `client_secret` to the frontend for confirmation.
    *   `handlePaymentSucceeded($paymentIntent)` [handlePaymentSucceeded](EDUVERS/app/Http/Controllers/StripeController.php:338): Processes successful payment events received via Stripe webhooks. It updates the associated [Subscription](EDUVERS/app/Models/Subscription.php) record, setting its status to 'active' and recording the `transaction_id`.
    *   `handlePaymentFailed($paymentIntent)` [handlePaymentFailed](EDUVERS/app/Http/Controllers/StripeController.php:350): Handles failed payment events from Stripe webhooks, updating the [Subscription](EDUVERS/app/Models/Subscription.php) status to 'cancelled' and noting the cancellation reason.
*   **External Relationships**:
    *   Interacts with the Stripe API using the `Stripe\\PaymentIntent` class [StripeController](EDUVERS/app/Http/Controllers/StripeController.php:9).
    *   Updates records in the `subscriptions` table via the [Subscription](EDUVERS/app/Models/Subscription.php) model.
    *   Receives requests from the frontend via the API routes defined in [api.php](EDUVERS/routes/api.php).

### **Subscription Model**

The **Subscription** model [Subscription](EDUVERS/app/Models/Subscription.php) represents a user's subscription in the database.

*   **Purpose**: Defines the structure and relationships for subscription data.
*   **Key Attributes**:
    *   `payment_intent_id` [payment_intent_id](EDUVERS/app/Models/Subscription.php:20): Stores the ID of the Stripe Payment Intent associated with the subscription.
    *   `payment_method` [payment_method](EDUVERS/app/Models/Subscription.php:21): Stores the payment method used for the subscription.
*   **External Relationships**:
    *   Managed by the [StripeController](EDUVERS/app/Http/Controllers/StripeController.php) for creation and updates.

### **Database Migrations**

The `subscriptions` table, which stores payment-related information, is created and managed by the migration file [2025_06_30_222823_create_subscriptions_table.php](EDUVERS/database/migrations/2025_06_30_222823_create_subscriptions_table.php).

*   **Purpose**: Defines the schema for the `subscriptions` table.
*   **Key Columns**:
    *   `payment_intent_id` [payment_intent_id](EDUVERS/database/migrations/2025_06_30_222823_create_subscriptions_table.php:25): Stores the Stripe Payment Intent ID.
    *   `payment_method` [payment_method](EDUVERS/database/migrations/2025_06_30_222823_create_subscriptions_table.php:26): Stores the payment method.

### **API Routes**

The backend exposes specific API routes for payment-related operations in [api.php](EDUVERS/routes/api.php).

*   **Purpose**: Defines the endpoints for frontend interaction with the payment system.
*   **Key Routes**:
    *   `POST /create-payment-intent` [create-payment-intent](EDUVERS/routes/api.php:135): Maps to the `createPaymentIntent` method in the [StripeController](EDUVERS/app/Http/Controllers/StripeController.php).

## Frontend Payment Interaction (React)

The frontend, built with React, provides the user interface for initiating and confirming payments.

### **CheckoutForm Component**

The **CheckoutForm** component [CheckoutForm](code-task-app/src/components/CheckoutForm.jsx) is responsible for collecting payment details and interacting with Stripe.

*   **Purpose**: Renders the payment form and handles the client-side Stripe integration.
*   **Key Functionality**:
    *   Uses the Stripe Elements library to securely collect card information.
    *   Calls the backend API to create a payment intent.
    *   Confirms the payment with Stripe using the `client_secret` received from the backend.
    *   Displays messages for successful or failed payments [CheckoutForm](code-task-app/src/components/CheckoutForm.jsx:96).
*   **External Relationships**:
    *   Communicates with the backend API (e.g., `/create-payment-intent`).
    *   Interacts directly with the Stripe.js library.

### **SuccessCelebration Component**

The **SuccessCelebration** component [SuccessCelebration](code-task-app/src/components/SuccessCelebration.jsx) is displayed upon successful payment.

*   **Purpose**: Provides visual confirmation and a congratulatory message after a successful payment [SuccessCelebration](code-task-app/src/components/SuccessCelebration.jsx:11).

### **SubscriptionHistory Page**

The **SubscriptionHistory** page [SubscriptionHistory](code-task-app/src/pages/SubscriptionHistory.jsx) displays a user's past subscriptions, including payment method details.

*   **Purpose**: Allows users to view their subscription history.
*   **Key Functionality**:
    *   Displays the `payment_method` for each subscription [SubscriptionHistory](code-task-app/src/pages/SubscriptionHistory.jsx:167).

### **SubscriptionPlans Page**

The **SubscriptionPlans** page [SubscriptionPlans](code-task-app/src/pages/SubscriptionPlans.jsx) outlines the available subscription options.

*   **Purpose**: Informs users about different subscription tiers.
*   **Key Information**:
    *   Mentions that plans are "one-time payments" [SubscriptionPlans](code-task-app/src/pages/SubscriptionPlans.jsx:75).

