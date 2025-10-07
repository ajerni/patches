# Cryptocurrency Addresses Setup

## Quick Setup

Add these environment variables to your `.env` file:

```env
# Cryptocurrency Donation Addresses (Public - displayed on About page)
NEXT_PUBLIC_BTC_ADDRESS="your-bitcoin-address-here"
NEXT_PUBLIC_ETH_ADDRESS="your-ethereum-address-here"
```

## Important Information

### Why NEXT_PUBLIC_ Prefix?

These environment variables use the `NEXT_PUBLIC_` prefix because:
- They are displayed publicly on your About page
- They need to be accessible in client-side React components
- Next.js requires this prefix for variables exposed to the browser

### Security Note

Since these are **public donation addresses**, there's no security risk in exposing them. Anyone can see them on your website anyway. However:
- Never use `NEXT_PUBLIC_` for private keys or sensitive data
- These should be **receive-only** addresses
- Never share private keys or seed phrases

## Setup Steps

1. **Add to .env file:**
   ```bash
   echo 'NEXT_PUBLIC_BTC_ADDRESS="your-btc-address"' >> .env
   echo 'NEXT_PUBLIC_ETH_ADDRESS="your-eth-address"' >> .env
   ```

2. **Replace with your actual addresses:**
   - Get your BTC address from your Bitcoin wallet
   - Get your ETH address from your Ethereum wallet
   - Make sure they're **receiving addresses**

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

4. **Verify on the About page:**
   - Visit `/about` in your browser
   - Scroll to the "Donate via Cryptocurrency" section
   - Confirm your addresses are displayed correctly

## Adding More Cryptocurrencies

To add more cryptocurrencies (like USDT, Litecoin, etc.):

1. Add the environment variable to `.env`:
   ```env
   NEXT_PUBLIC_USDT_ADDRESS="your-usdt-address"
   ```

2. Edit `/app/about/page.tsx` and add a new entry in the crypto section:
   ```tsx
   <div>
     <p className="text-xs font-semibold text-gray-700 mb-1">USDT (TRC20)</p>
     <div className="bg-gray-50 p-2 rounded text-xs font-mono break-all">
       {process.env.NEXT_PUBLIC_USDT_ADDRESS || 'USDT address not configured'}
     </div>
   </div>
   ```

## Fallback Behavior

If an address is not configured:
- BTC section shows: "BTC address not configured"
- ETH section shows: "ETH address not configured"
- The sections remain visible but inform users to contact you for crypto donations

## Testing

1. **Without addresses set:**
   - Should show "address not configured" messages
   
2. **With addresses set:**
   - Should display your actual wallet addresses
   - Addresses should be in monospace font
   - Should allow easy copy-paste

## Deployment Notes

When deploying to production (Vercel, etc.):

1. Add the same environment variables in your hosting platform's settings
2. Remember: use `NEXT_PUBLIC_` prefix
3. Redeploy for changes to take effect

### Vercel Example

```bash
vercel env add NEXT_PUBLIC_BTC_ADDRESS
# Enter your BTC address when prompted

vercel env add NEXT_PUBLIC_ETH_ADDRESS
# Enter your ETH address when prompted
```

## Troubleshooting

### Addresses not showing?

1. Check your `.env` file has the correct variables
2. Ensure you used `NEXT_PUBLIC_` prefix
3. Restart your dev server (`npm run dev`)
4. Clear browser cache and reload

### Still showing placeholders?

1. Verify the environment variables in your deployment platform
2. Check for typos in variable names
3. Ensure you deployed after adding the variables

## Support

If you encounter issues, the addresses will show fallback text instead of breaking the page. Users can still contact you via the contact form for donation information.

