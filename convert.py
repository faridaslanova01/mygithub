import json
import re

file_path = "SITE_1101_Fall_2026_Project_04_Chat_Log.md"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

json_match = re.search(r"\{.*\}", content, re.DOTALL)
if json_match:
    json_data = json.loads(json_match.group(0))
    
    markdown_output = "# AI Chat Log\n\n"
    markdown_output += "_Exported from VS Code Chat Log_\n\n"

    requests = json_data.get("requests", [])
    for idx, req in enumerate(requests, 1):
        user_text = req.get("message", {}).get("text", "")
        
        markdown_output += f"---\n\n**User**\n\n{user_text}\n\n---\n\n"

        responses = req.get("response", [])
        ai_texts = []
        for res in responses:
            if isinstance(res, dict) and "value" in res:
                val = res["value"]
                # Əgər dəyər siyahıdırsa, içindəki elementləri birləşdiririk
                if isinstance(val, list):
                    val = " ".join([str(v) for v in val])
                
                if isinstance(val, str):
                    if not val.startswith("Running `") and not val.startswith("Generating patch"):
                        ai_texts.append(val)

        ai_response_combined = "\n\n".join(ai_texts)
        if ai_response_combined:
            markdown_output += f"**Cursor**\n\n{ai_response_combined}\n\n"

    with open("ai-chat-site1101.md", "w", encoding="utf-8") as out_f:
        out_f.write(markdown_output)

    print("Hər şey hazırdır! 'ai-chat-site1101.md' faylı uğurla yaradıldı.")
else:
    print("Xəta: Faylda uyğun JSON formatı tapılmadı.")