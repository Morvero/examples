// Morvero agent-telemetry emitter — the whole instrumentation for an AI-agent
// pilot. Node 18+, zero dependencies. Docs: https://morvero.com/docs#agents
//
// Conventions (these produce the pilot scorecard — task success rate,
// escalation rate, cost per conversation, cost per completed task):
//   conversation started  -> conversationStarted('/entry-surface')
//   capability/tool call  -> capability('capability-name', costUsd)
//   task outcome          -> taskCompleted() | taskFailed() | escalated()
//   user thumbs           -> thumbs('up' | 'down', 'optional comment')
//
// Rules: visitorId (userId here) must be pseudonymous and stable — a salted
// hash of the employee id, never an email. Telemetry is fire-and-forget and
// must never break or slow the agent.

export class MorveroAgent {
  constructor({ host = 'https://morvero.com', key, userId }) {
    Object.assign(this, { host, key, userId });
  }
  #post(path, body) { // fire-and-forget: telemetry must never break the agent
    fetch(this.host + path, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: this.key, visitorId: this.userId, ...body }),
    }).catch(() => {});
  }
  conversationStarted(surface = '/chat') { this.#post('/api/collect/pageview', { path: surface }); }
  capability(name, cost = 0, surface = '/chat') { this.#post('/api/collect/action', { action: name, cost, path: surface }); }
  taskCompleted() { this.capability('task-completed'); }
  taskFailed() { this.capability('task-failed'); }
  escalated() { this.capability('escalated-to-human'); }
  async thumbs(direction, comment = '', surface = '/chat') {
    const cfg = await (await fetch(`${this.host}/api/widget-config?key=${this.key}`)).json();
    this.#post('/api/collect/feedback', { token: cfg.token, thumb: direction, comment, path: surface, platform: 'agent' });
  }
}

// --- Example run -----------------------------------------------------------
// MORVERO_KEY=fbk_your_agent_product_key node morvero-agent.mjs
if (process.env.MORVERO_KEY) {
  const morvero = new MorveroAgent({ key: process.env.MORVERO_KEY, userId: 'emp-8f2a' });

  morvero.conversationStarted('/support-copilot');
  morvero.capability('search-kb', 0.004);
  morvero.capability('draft-reply', 0.011);
  morvero.taskCompleted();
  await morvero.thumbs('up', 'Answered on the first try');

  console.log('Sent one example conversation. Check the product page in Morvero,');
  console.log('or ask your coding agent to run the MCP tool verify_install.');
} else {
  console.log('Set MORVERO_KEY=fbk_... to send an example conversation.');
}

// --- Framework adapters (shapes, not gospel) -------------------------------
//
// Claude Agent SDK / Anthropic tool loop:
//   morvero.conversationStarted('/support-copilot');
//   for await (const message of agentSession) {
//     if (message.type === 'tool_use') morvero.capability(message.name);
//     if (message.usage) morvero.capability('turn', costFromUsage(message.usage));
//   }
//   morvero.taskCompleted(); // or taskFailed() / escalated()
//
// LangChain (JS):
//   const handler = {
//     handleChainStart: () => morvero.conversationStarted('/langchain-app'),
//     handleToolStart: (tool) => morvero.capability(tool.name),
//     handleLLMEnd: (out) => morvero.capability('turn', costFromUsage(out.llmOutput?.tokenUsage)),
//   };
//   await chain.invoke(input, { callbacks: [handler] });
//
// Python (any framework) — the same three POSTs with requests from run hooks.
