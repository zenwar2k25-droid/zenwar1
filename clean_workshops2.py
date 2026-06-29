import sys

with open('src/pages/superadmin/Workshops.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's just find the start and end markers of the block and remove all of them.
start_marker = "                  {shop.status === 'Active' && shop.verified && ("
end_marker = "                      <ShieldAlert size={12} /> Remove Verify\n                    </button>\n                  )}"

while True:
    start_idx = content.find(start_marker)
    if start_idx == -1:
        break
    
    end_idx = content.find(end_marker, start_idx)
    if end_idx == -1:
        # If we can't find the end marker, we must break to avoid infinite loop
        break
        
    # We found a block! Remove it.
    # The block ends after end_marker + length of end_marker
    block_end = end_idx + len(end_marker)
    
    # Also consume any trailing newline
    if block_end < len(content) and content[block_end] == '\n':
        block_end += 1
        
    content = content[:start_idx] + content[block_end:]

# Now re-add exactly one valid instance of the block, after the Verify Workshop block
verify_marker = "                      <ShieldCheck size={12} /> Verify Workshop\n                    </button>\n                  )}"

verify_idx = content.find(verify_marker)
if verify_idx != -1:
    insertion_point = verify_idx + len(verify_marker)
    
    valid_block = """
""" + start_marker + """
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWorkshopVerification(shop.id);
                        setToastMsg('Verification Removed');
                        setTimeout(() => setToastMsg(''), 3000);
                      }}
                      className="flex-1 py-2 text-[10px] font-bold text-gray-400 hover:text-red-400 bg-white/5 hover:bg-white/10 border border-transparent hover:border-red-500/30 rounded-lg transition-all flex items-center justify-center gap-1"
                    >
""" + end_marker

    content = content[:insertion_point] + valid_block + content[insertion_point:]

with open('src/pages/superadmin/Workshops.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleaned exactly all occurrences by index slicing.")
