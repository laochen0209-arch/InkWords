# Tasks

- [x] Task 1: Create GumroadButton component
  - [x] SubTask 1.1: Create `components/GumroadButton.tsx` with "use client" directive
  - [x] SubTask 1.2: Add Gumroad JS script integration
  - [x] SubTask 1.3: Implement button with userId prop and gumroad overlay attribute
  - [x] SubTask 1.4: Style button to match existing VIP button design

- [x] Task 2: Update Profile Page
  - [x] SubTask 2.1: Import GumroadButton in `app/profile/page.tsx`
  - [x] SubTask 2.2: Replace handleVipClick router.push with GumroadButton
  - [x] SubTask 2.3: Pass user.id to GumroadButton component
  - [x] SubTask 2.4: Update VipBanner click behavior

- [x] Task 3: Create Gumroad Webhook Handler
  - [x] SubTask 3.1: Create `app/api/webhooks/gumroad/route.ts`
  - [x] SubTask 3.2: Implement POST handler to parse formData
  - [x] SubTask 3.3: Extract user_id from webhook payload
  - [x] SubTask 3.4: Initialize Supabase admin client with SERVICE_ROLE_KEY
  - [x] SubTask 3.5: Update user record is_vip to true
  - [x] SubTask 3.6: Return 200 response

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 can be done in parallel with Task 1 and 2
