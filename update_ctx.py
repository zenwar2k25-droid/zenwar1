import re

def update_seed_data():
    with open('src/data/seedData.ts', 'r', encoding='utf-8') as f:
        content = f.read()
    
    old_verified = "  verified?: boolean;"
    new_verified = """  verified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationStatus?: 'VERIFIED' | 'PENDING';"""
    
    if old_verified in content and "verificationStatus" not in content:
        content = content.replace(old_verified, new_verified)
        with open('src/data/seedData.ts', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated seedData.ts")
    else:
        print("seedData.ts already updated or pattern not found")

def update_database_context():
    with open('src/context/DatabaseContext.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Update verifyWorkshop
    verify_old = """  const verifyWorkshop = (id: string) => {
    setWorkshops(prev => prev.map(w => w.id === id ? { ...w, verified: true, verifiedAt: new Date().toISOString() } : w));
  };"""
    
    verify_new = """  const verifyWorkshop = (id: string) => {
    setWorkshops(prev => prev.map(w => w.id === id ? { 
      ...w, 
      verified: true, 
      verifiedAt: new Date().toISOString(),
      verifiedBy: currentSaUserId || 'Super Admin',
      verificationStatus: 'VERIFIED'
    } : w));
    addSaAuditLog('WORKSHOP_VERIFIED', `Workshop ID ${id} was verified`);
  };"""

    if verify_old in content:
        content = content.replace(verify_old, verify_new)

    # Update removeWorkshopVerification
    remove_old = """  const removeWorkshopVerification = (id: string) => {
    setWorkshops(prev => prev.map(w => w.id === id ? { ...w, verified: false, verifiedAt: undefined } : w));
  };"""

    remove_new = """  const removeWorkshopVerification = (id: string) => {
    setWorkshops(prev => prev.map(w => w.id === id ? { 
      ...w, 
      verified: false, 
      verifiedAt: undefined,
      verifiedBy: undefined,
      verificationStatus: 'PENDING'
    } : w));
    addSaAuditLog('VERIFICATION_REMOVED', `Verification removed for Workshop ID ${id}`);
  };"""

    if remove_old in content:
        content = content.replace(remove_old, remove_new)

    with open('src/context/DatabaseContext.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated DatabaseContext.tsx")

update_seed_data()
update_database_context()
