export const McpClientSelector = ({ variant = "agent", showSeeAll = true } = {}) => {
  // Clipboard API can be unavailable or denied; fall back to execCommand.
  // Inlined per component: Mintlify compiles snippet exports in isolation.
  const writeClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      let copied = false;
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      }
      document.body.removeChild(textarea);
      return copied;
    }
  };
  const isHuman = variant === "human";
  const mcpUrl = isHuman
    ? "https://mcp.firecrawl.dev/v2/mcp-oauth"
    : "https://mcp.firecrawl.dev/v2/mcp";
  // Deep link config is always {"url": mcpUrl}; compute it instead of hardcoding
  // so a different variant's URL can never drift out of sync with the JSON below.
  const cursorInstallUrl = `cursor://anysphere.cursor-deeplink/mcp/install?name=firecrawl&config=${btoa(
    JSON.stringify({ url: mcpUrl })
  )}`;
  const cursorConfig = `{
  "mcpServers": {
    "firecrawl": {
      "url": "${mcpUrl}"
    }
  }
}`;
  const opencodeConfig = `{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "firecrawl": {
      "type": "remote",
      "url": "${mcpUrl}",
      "enabled": true
    }
  }
}`;
  const clients = [
    {
      id: "codex",
      name: "Codex",
      detail: "Run in terminal",
      icon: "/images/agent-clients/codex.svg",
      iconClassName: "",
      command: isHuman
        ? `codex mcp add firecrawl --url ${mcpUrl} && codex mcp login firecrawl`
        : `codex mcp add firecrawl --url ${mcpUrl}`,
      description: "Run this in your terminal to add Firecrawl as a remote MCP server in Codex.",
      hint: isHuman ? (
        <>
          Then enter <code>/mcp</code> in Codex and confirm <strong>firecrawl</strong> is
          connected.
        </>
      ) : (
        <>
          Then run <code>codex mcp list</code> and confirm <strong>firecrawl</strong> is
          enabled.
        </>
      ),
    },
    {
      id: "claude-code",
      name: "Claude Code",
      detail: "Run in terminal",
      icon: "/images/agent-clients/claude-code.svg",
      iconClassName: "",
      command: `claude mcp add --transport http firecrawl ${mcpUrl}`,
      description: "Run this in your terminal to add Firecrawl as a remote MCP server in Claude Code.",
      hint: isHuman ? (
        <>
          Then enter <code>/mcp</code> in Claude Code and complete the browser sign-in.
        </>
      ) : (
        <>
          Then run <code>/mcp</code> and confirm <strong>firecrawl</strong> is connected.
        </>
      ),
    },
    {
      id: "cursor",
      name: "Cursor",
      detail: "One click",
      icon: "/images/agent-clients/cursor.svg",
      iconClassName: "fc-client-icon-mono",
      code: cursorConfig,
      codeLabel: "mcp.json",
      installUrl: cursorInstallUrl,
      description:
        "Install the hosted MCP server in one click, or copy the configuration below.",
      hint: isHuman ? (
        <>
          Open <strong>Cursor Settings</strong>, select <strong>MCP</strong>, and complete the
          Firecrawl sign-in.
        </>
      ) : (
        <>
          Open <strong>Cursor Settings</strong>, select <strong>MCP</strong>, and confirm{" "}
          <strong>firecrawl</strong> is connected.
        </>
      ),
    },
    {
      id: "opencode",
      name: "OpenCode",
      detail: "Copy config",
      icon: "/images/agent-clients/opencode.svg",
      iconClassName: "fc-client-icon-mono",
      code: opencodeConfig,
      codeLabel: "opencode.json",
      description: isHuman
        ? "Add this remote server configuration to your global or project config. OpenCode opens Firecrawl in your browser on first use."
        : "Add this remote server configuration to your global or project config.",
      hint: isHuman ? (
        <>
          Sign in and approve access, then confirm <strong>firecrawl</strong> is connected.
        </>
      ) : (
        <>
          Then run <code>opencode mcp list</code> and confirm{" "}
          <strong>firecrawl</strong> is connected.
        </>
      ),
    },
  ];
  const [activeId, setActiveId] = useState(clients[0].id);
  const [copiedId, setCopiedId] = useState(null);
  const [status, setStatus] = useState("");
  const tabRefs = useRef([]);
  const timeoutRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const copy = async (id, text, label) => {
    const copied = await writeClipboard(text);
    if (copied) {
      window.clearTimeout(timeoutRef.current);
      setCopiedId(id);
      setStatus(`${label} copied to clipboard.`);
      timeoutRef.current = window.setTimeout(() => {
        setCopiedId(null);
        setStatus("");
      }, 2000);
    } else {
      setCopiedId(null);
      setStatus(`Could not copy ${label.toLowerCase()}.`);
    }
  };

  const copyIcon = () => (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
  const checkIcon = () => (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
  const arrowIcon = () => (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
  const curvyCorners = () => {
    const path =
      "M11 1L11 11L10 11L10 7C10 3.68629 7.31371 1 4 1L0 1L0 0L11 0L11 1Z";
    return (
      <span className="fc-curvy-corners" aria-hidden="true">
        <svg className="fc-curve fc-curve-tl" viewBox="0 0 11 11">
          <path d={path} />
        </svg>
        <svg className="fc-curve fc-curve-tr" viewBox="0 0 11 11">
          <path d={path} />
        </svg>
        <svg className="fc-curve fc-curve-bl" viewBox="0 0 11 11">
          <path d={path} />
        </svg>
        <svg className="fc-curve fc-curve-br" viewBox="0 0 11 11">
          <path d={path} />
        </svg>
      </span>
    );
  };
  const copyButton = ({ id, text, label }) => {
    const copied = copiedId === id;
    return (
      <button
        type="button"
        className={copied ? "fc-copy-button is-copied" : "fc-copy-button"}
        onClick={() => copy(id, text, label)}
        aria-label={copied ? `${label} copied` : `Copy ${label}`}
      >
        {copied ? checkIcon() : copyIcon()}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
    );
  };
  const commandRow = ({ id, command, label, prompt }) => (
    <div className="fc-command-row">
      <div className="fc-command-scroll" tabIndex={0}>
        {prompt && (
          <span className="fc-command-prompt" aria-hidden="true">
            $
          </span>
        )}
        <code>{command}</code>
      </div>
      {copyButton({ id, text: command, label })}
    </div>
  );
  const codeBlock = ({ client }) => (
    <div className="fc-code-block">
      <div className="fc-code-header">
        <span>{client.codeLabel}</span>
        {copyButton({
          id: `code-${client.id}`,
          text: client.code,
          label: client.codeLabel,
        })}
      </div>
      <pre>
        <code>{client.code}</code>
      </pre>
    </div>
  );
  const selectTab = (index) => {
    const client = clients[index];
    setActiveId(client.id);
    tabRefs.current[index]?.focus();
  };
  const handleKeyDown = (event, index) => {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % clients.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + clients.length) % clients.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = clients.length - 1;
    else return;

    event.preventDefault();
    selectTab(nextIndex);
  };

  return (
    <section className="fc-agent-first not-prose" aria-labelledby="fc-mcp-heading">
      {curvyCorners()}
      <div className="fc-agent-first-header">
        <div>
          <h3 id="fc-mcp-heading">Set up Firecrawl MCP</h3>
          <p>
            {isHuman
              ? "Sign in via browser."
              : "No API key required. Add an API key to unlock more usage."}
          </p>
        </div>
        {showSeeAll && (
          <a
            className="fc-all-options-link"
            href={isHuman ? "/mcp-server/oauth" : "/mcp-server/keyless"}
          >
            See all setup options {arrowIcon()}
          </a>
        )}
      </div>

      <div className="fc-client-tabs" role="tablist" aria-label="Choose an MCP client">
        {clients.map((client, index) => {
          const selected = activeId === client.id;
          return (
            <button
              key={client.id}
              id={`fc-tab-${client.id}`}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              className={selected ? "fc-client-tab is-active" : "fc-client-tab"}
              aria-selected={selected}
              aria-controls={`fc-panel-${client.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(client.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <img
                className={
                  client.iconClassName === "fc-client-icon-mono"
                    ? "fc-client-icon fc-client-icon-mono"
                    : "fc-client-icon"
                }
                src={client.icon}
                alt=""
                width={26}
                height={26}
                aria-hidden="true"
              />
              <span className="fc-client-tab-copy">
                <strong>{client.name}</strong>
                <span>{client.detail}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="fc-client-panels">
        {clients.map((client) => {
          const selected = activeId === client.id;
          return (
            <div
              key={client.id}
              id={`fc-panel-${client.id}`}
              role="tabpanel"
              aria-labelledby={`fc-tab-${client.id}`}
              hidden={!selected}
              className="fc-client-panel"
            >
              <p className="fc-client-description">{client.description}</p>
              {client.installUrl && (
                <a className="fc-install-button" href={client.installUrl}>
                  Add to Cursor {arrowIcon()}
                </a>
              )}
              {client.command
                ? commandRow({
                    id: `code-${client.id}`,
                    command: client.command,
                    label: "Command",
                    prompt: true,
                  })
                : codeBlock({ client })}
              <p className="fc-client-hint">{client.hint}</p>
            </div>
          );
        })}
      </div>
      <div className="fc-agent-first-footer">
        <p className="fc-footer-lead">Using another MCP client? Point it at:</p>
        {commandRow({ id: "endpoint-url", command: mcpUrl, label: "Endpoint URL" })}
      </div>
      <span className="fc-sr-only" aria-live="polite">
        {status}
      </span>
    </section>
  );
};

export const AgentSetupButton = () => {
  const prompt = "Read and follow https://www.firecrawl.dev/agent-onboarding/SKILL.md";
  // Clipboard API can be unavailable or denied; fall back to execCommand.
  // Inlined per component: Mintlify compiles snippet exports in isolation.
  const writeClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      let copied = false;
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      }
      document.body.removeChild(textarea);
      return copied;
    }
  };
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");
  const timeoutRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const copyPrompt = async () => {
    const copied = await writeClipboard(prompt);
    if (copied) {
      window.clearTimeout(timeoutRef.current);
      setCopied(true);
      setStatus("Agent setup prompt copied to clipboard.");
      timeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        setStatus("");
      }, 2000);
    } else {
      setCopied(false);
      setStatus("Could not copy the agent setup prompt.");
    }
  };
  const icon = copied ? (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m20 6-11 11-5-5" />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );

  return (
    <div className="fc-agent-prompt not-prose">
      <button
        type="button"
        className={copied ? "fc-agent-prompt-button is-copied" : "fc-agent-prompt-button"}
        onClick={copyPrompt}
        aria-label={copied ? "Copied agent setup prompt" : "Setup for agents"}
      >
        {icon}
        <span>{copied ? "Copied" : "Setup for agents"}</span>
      </button>
      <span className="fc-sr-only" aria-live="polite">
        {status}
      </span>
    </div>
  );
};
