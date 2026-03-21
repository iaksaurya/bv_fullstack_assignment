
---

#  3. `REFLECTION.md`

```markdown
# Reflection

Using AI agents in this project significantly improved development speed, especially during initial setup and repetitive tasks. Tools like ChatGPT and GitHub Copilot helped generate boilerplate code, explain architectural concepts, and debug issues quickly. This allowed me to focus more on understanding system design and implementing core business logic instead of spending time on syntax or setup problems.

However, AI-generated code was not always correct. In several cases, it violated hexagonal architecture by mixing database logic into controllers or services. Some outputs also included overly generic logic that did not match the actual problem requirements. Because of this, I carefully reviewed all generated code, validated it using TypeScript checks, and tested it by running the application locally.

The key learning is that AI works best as a productivity tool, not as a replacement for understanding. It accelerates development but still requires strong validation and decision-making from the developer. Compared to manual coding, AI improved efficiency significantly, especially in writing repetitive code and documentation.

If I were to improve this process, I would write more precise prompts earlier, add automated tests sooner, and rely more on incremental generation instead of large code blocks. Overall, AI made the workflow faster and more structured, but correctness still depended on manual verification.