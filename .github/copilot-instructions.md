# GitHub Copilot Instructions

## Running Services in Development Mode

1. Navigate to the service directory:
   ```bash
   cd /path/to/service
   ```
2. Install dependencies (if not already installed):
   ```bash
   pnpm install
   ```
3. Start the service in development mode:
   ```bash
   pnpm start:dev
   ```
   This will enable hot-reloading for faster development.

## Running Services in Production Mode

1. Navigate to the service directory:
   ```bash
   cd /path/to/service
   ```
2. Build the service:
   ```bash
   pnpm build
   ```
3. Start the service in production mode:
   ```bash
   pnpm start:prod
   ```

## Editing a Service

To help GitHub Copilot understand the context of the service you want to edit, follow these guidelines:

0. **Services Location**:
   - all services located under ./services folder

1. **Specify the Service Name**:
   - Clearly mention the service name (e.g., `backend` or `oauth2`) in your request.

2. **Provide File Paths**:
   - Include the file path or directory structure to help locate the relevant files.

3. **Describe the Task**:
   - Clearly state what you want to edit or add (e.g., "Add a new endpoint to the `backend` service").

4. **Use Contextual Keywords**:
   - Use terms like "edit", "add", "update", or "remove" to specify the action.

## Example Requests

- "Edit the `backend` service to add a new `/status` endpoint that returns the service status."
- "Update the `oauth2` service to include a new OAuth2 client configuration."

5. **IMPORTANT: To run a specific service in this monorepo, use the following approach:**

```bash
# From the services directory
pnpm start:dev oauth2    # Start ONLY the oauth2 service
pnpm start:dev backend   # Start ONLY the backend service
```
