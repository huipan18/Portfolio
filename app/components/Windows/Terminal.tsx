"use client";
import { terminalCheatsheet, profile, experience, education, certifications } from "@/Constants/profile";
import { projects } from "@/Constants/projects";
import { useState, useRef, useEffect } from "react";
import { useKeyboardShortcut } from "@/util/Hooks/useShortcut";
import useAppWindows from "@/store/useAppWindows";
import clsx from "clsx";

interface Line {
  command: string;
  output?: string;
}

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { command: "help", output: `Welcome to ${profile.name}'s portfolio terminal. Try: ${terminalCheatsheet.join(', ')}` },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { removeWindow } = useAppWindows();

  useKeyboardShortcut({
    shortcuts: [{ key: "ArrowUp", isSpecialKey: true }],
    onTrigger: () => {
      if (commandHistory.length === 0) return;
      const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(newIndex);
      setCurrent(commandHistory[commandHistory.length - 1 - newIndex]);
    },
  });

  useKeyboardShortcut({
    shortcuts: [{ key: "ArrowDown", isSpecialKey: true }],
    onTrigger: () => {
      if (historyIndex <= 0) {
        setCurrent("");
        setHistoryIndex(-1);
        return;
      }
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrent(commandHistory[commandHistory.length - 1 - newIndex]);
    },
  });

  const getOutputForCommand = (cmd: string): string | undefined => {
    const normalized = cmd.trim().toLowerCase();

    const outputs: Record<string, string | undefined> = {
      help: `Available commands:\n${terminalCheatsheet.join('\n')}`,
      whoami: `${profile.name} — ${profile.title}`,
      about: `${profile.summary}\n\nLocation: ${profile.location}`,
      skills: profile.skillBadges.join(' · '),
      projects: projects.map((project, index) => `${index + 1}. ${project.name} — ${project.category}`).join('\n'),
      experience: experience.map((item) => `${item.role} @ ${item.company} (${item.period})`).join('\n'),
      education: education.map((item) => `${item.degree} — ${item.school} (${item.period})`).join('\n'),
      certifications: certifications.map((item) => `${item.title} — ${item.date}`).join('\n'),
      contact: `Email: ${profile.email}\nPhone: ${profile.phone}\nLinkedIn: ${profile.linkedin}\nGitHub: ${profile.github}`,
      resume: `Open resume: ${profile.resumePath}`,
      ls: terminalCheatsheet.join('    '),
      pwd: '/Users/keerat/portfolio',
      hostname: 'keerat-macintosh',
      date: new Date().toString(),
      clear: undefined,
      exit: 'logout\n[Process completed]',
      logout: 'logout\n[Process completed]',
    };

    if (normalized === 'clear') {
      setLines([]);
      return undefined;
    }

    if (normalized === 'resume') {
      window.open(profile.resumePath, '_blank', 'noopener,noreferrer');
      return outputs.resume;
    }

    if (normalized === 'linkedin') {
      window.open(profile.linkedin, '_blank', 'noopener,noreferrer');
      return `Opening LinkedIn...`;
    }

    if (normalized === 'github') {
      window.open(profile.github, '_blank', 'noopener,noreferrer');
      return `Opening GitHub...`;
    }

    if (normalized === 'exit' || normalized === 'logout') {
      setTimeout(() => removeWindow('icon-4'), 300);
      return outputs[normalized];
    }

    if (normalized in outputs) return outputs[normalized];
    return `Command not found: ${cmd}. Type 'help' to explore the portfolio.`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const command = current.trim();
      if (!command) return;
      const output = getOutputForCommand(command);
      setCommandHistory((prev) => [...prev, command]);
      setLines((prev) => [...prev, { command, output }]);
      setCurrent('');
      setHistoryIndex(-1);
    }
  };

  useEffect(() => {
    terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      ref={terminalRef}
      className="h-full overflow-auto rounded-b-2xl bg-[#0b1020] px-4 py-3 font-mono text-sm text-green-300"
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((line, idx) => (
        <div key={`${line.command}-${idx}`} className="mb-2">
          <div>
            <span className={clsx("text-cyan-300")}>keerat@macintosh ~ %</span> {line.command}
          </div>
          {line.output && <pre className="whitespace-pre-wrap text-green-200/90 mt-1">{line.output}</pre>}
        </div>
      ))}
      <div className="flex items-center gap-2">
        <span className="text-cyan-300">keerat@macintosh ~ %</span>
        <input
          ref={inputRef}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-green-200"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
