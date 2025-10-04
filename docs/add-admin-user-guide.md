# Adding Second Admin User - MyMeds Pharmacy

This guide will help you add a second admin user to your MyMeds Pharmacy system.

## Admin User Details

**Email:** `mymedspharmacyinc@gmail.com`  
**Password:** `Pharm-23-medS`  
**Name:** `MyMeds Admin`  
**Role:** `ADMIN`

## Step 1: Add Environment Variables

Add these lines to your `.env` file on the VPS:

```bash
# Second Admin User
ADMIN2_EMAIL=mymedspharmacyinc@gmail.com
ADMIN2_PASSWORD_HASH=$2b$12$auPmZQBuFSoEiqpK1mTQWu7ItdaRkAQjKgK0xL/X8TDA3iuGEnNFa
ADMIN2_FIRST_NAME=MyMeds
ADMIN2_LAST_NAME=Admin
```

## Step 2: Deploy Scripts to VPS

Upload the following files to your VPS:

1. `backend/src/ensureAdminUser2.ts` - The admin user creation script
2. `backend/add-admin-user.js` - Alternative JavaScript version
3. `scripts/add-admin-user.sh` - Bash script for VPS execution

## Step 3: Run on VPS

SSH into your VPS and run:

```bash
cd /var/www/mymeds-pharmacy/backend

# Option 1: Using TypeScript
npx ts-node src/ensureAdminUser2.ts

# Option 2: Using JavaScript
node add-admin-user.js mymedspharmacyinc@gmail.com "Pharm-23-medS" "MyMeds" "Admin"

# Option 3: Using bash script
chmod +x scripts/add-admin-user.sh
./scripts/add-admin-user.sh mymedspharmacyinc@gmail.com "Pharm-23-medS" "MyMeds" "Admin"
```

## Step 4: Verify Admin User

After running the script, you should see:

```
✅ Second admin user created: mymedspharmacyinc@gmail.com
👤 Name: MyMeds Admin
🔑 Email: mymedspharmacyinc@gmail.com
🔒 Password: Pharm-23-medS

🎉 Second admin user setup complete!
📝 Login credentials:
   Email: mymedspharmacyinc@gmail.com
   Password: Pharm-23-medS

⚠️  Please change the password after first login for security.
```

## Step 5: Test Login

1. Go to your admin login page: `http://your-domain/admin-signin`
2. Use the credentials:
   - **Email:** `mymedspharmacyinc@gmail.com`
   - **Password:** `Pharm-23-medS`
3. Change the password after first login for security

## Troubleshooting

### Database Connection Issues
If you get database connection errors, ensure:
- Your `.env` file has the correct `DATABASE_URL`
- The database service is running
- Prisma client is generated: `npx prisma generate`

### User Already Exists
If the user already exists, the script will update the existing user with the new password hash.

### Permission Issues
Make sure the script has proper permissions:
```bash
chmod +x scripts/add-admin-user.sh
```

## Security Notes

1. **Change Default Password**: Always change the password after first login
2. **Strong Passwords**: Use complex passwords with mixed characters
3. **Regular Updates**: Keep admin credentials updated
4. **Access Logging**: Monitor admin access through the audit logs

## Multiple Admin Users

You can add more admin users by:
1. Generating new bcrypt hashes for passwords
2. Adding new environment variables (ADMIN3_EMAIL, etc.)
3. Creating new scripts or modifying existing ones

## Support

If you encounter any issues:
1. Check the application logs
2. Verify database connectivity
3. Ensure all environment variables are set
4. Contact your system administrator
