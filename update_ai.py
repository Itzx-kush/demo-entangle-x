import sys

with open('backend/app/api/ai.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('from google import genai\nfrom google.genai import types\nfrom google.genai.errors import APIError', 'from groq import AsyncGroq, APIError')
content = content.replace('if not settings.gemini_api_key:', 'if not settings.groq_api_key:')
content = content.replace('client = genai.Client(api_key=settings.gemini_api_key)', 'client = AsyncGroq(api_key=settings.groq_api_key)')
content = content.replace('gemini_api_error', 'groq_api_error')
content = content.replace('gemini_unexpected_error', 'groq_unexpected_error')

old_builder = """    contents = []
    for msg in request.conversation:
        contents.append(
            types.Content(
                role=msg.role,
                parts=[types.Part.from_text(text=msg.content)]
            )
        )
    
    contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=request.message)]
        )
    )"""

new_builder = """    messages = [{"role": "system", "content": system_instruction}]
    for msg in request.conversation:
        messages.append({"role": "assistant" if msg.role == "model" else msg.role, "content": msg.content})
    messages.append({"role": "user", "content": request.message})"""

content = content.replace(old_builder, new_builder)

old_gen = """    try:
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            max_output_tokens=800,
            temperature=0.2,
        )
        
        response = await client.aio.models.generate_content(
            model=settings.gemini_model,
            contents=contents,
            config=config,
        )
        
        if not response.text:
            raise AppError("ai_empty_response", "The AI returned an empty response.", 500)
            
        return ChatResponse(reply=response.text)"""

new_gen = """    try:
        response = await client.chat.completions.create(
            model=settings.groq_model,
            messages=messages,
            max_tokens=800,
            temperature=0.2,
        )
        
        reply = response.choices[0].message.content
        if not reply:
            raise AppError("ai_empty_response", "The AI returned an empty response.", 500)
            
        return ChatResponse(reply=reply)"""

content = content.replace(old_gen, new_gen)

with open('backend/app/api/ai.py', 'w', encoding='utf-8') as f:
    f.write(content)
