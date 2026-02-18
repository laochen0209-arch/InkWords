# 集成 Gumroad 支付功能 Spec

## Why
用户点击个人中心页面的"立即开通"按钮后跳转到 `/subscription` 会报 404，因为之前的 Stripe 和 Lemon Squeezy 支付代码已被清理。现在需要用 Gumroad 替换，实现无缝的支付体验。

## What Changes
- 新增 `GumroadButton` 组件，支持 Gumroad 支付弹窗
- 修改 `app/profile/page.tsx`，替换原有的 VIP 点击跳转逻辑
- 新增 `app/api/webhooks/gumroad/route.ts` 处理支付回调
- **BREAKING**: 移除原有的 `/subscription` 页面跳转逻辑

## Impact
- Affected specs: 用户支付流程、VIP 状态管理
- Affected code: `app/profile/page.tsx`, `components/GumroadButton.tsx`, `app/api/webhooks/gumroad/route.ts`

## ADDED Requirements

### Requirement: Gumroad 支付按钮组件
The system SHALL provide a Gumroad payment button component that opens the payment overlay.

#### Scenario: User clicks upgrade button
- **WHEN** user clicks the upgrade button on profile page
- **THEN** Gumroad payment overlay opens with user_id parameter
- **AND** user can complete payment without leaving the page

### Requirement: Gumroad Webhook 处理
The system SHALL handle Gumroad payment webhooks to activate VIP status.

#### Scenario: Successful payment webhook
- **WHEN** Gumroad sends a webhook request to `/api/webhooks/gumroad`
- **AND** the request contains valid user_id
- **THEN** update the user's is_vip field to true in Supabase
- **AND** return 200 status code

## MODIFIED Requirements

### Requirement: Profile Page VIP Banner
The profile page SHALL use GumroadButton instead of router.push('/subscription').

#### Scenario: VIP banner click
- **GIVEN** user is on profile page
- **WHEN** user clicks VIP banner
- **THEN** Gumroad payment overlay opens (if not VIP)
- **OR** show VIP status (if already VIP)

## REMOVED Requirements

### Requirement: Stripe/Lemon Squeezy Subscription Pages
**Reason**: Payment provider changed to Gumroad
**Migration**: Use new GumroadButton component instead
