import type { ReactNode } from "react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import PopIn from "../motions/popin";
import FadeIn from "../motions/FadeIn";
import { getTaskStatus, MESSAGE_TYPE_SYSTEM, TASK_STATUS_EXECUTING } from "../../types/agentTypes";
import clsx from "clsx";
import { ChatMessage } from "./ChatMessage";
import type { HeaderProps } from "./MacWindowHeader";
import { MacWindowHeader, messageListId } from "./MacWindowHeader";
import { ExampleAgentButton } from "./ExampleAgentButton";

interface ChatWindowProps extends HeaderProps {
  children?: ReactNode;
  fullscreen?: boolean;
  scrollToBottom?: boolean;
  setAgentRun?: (name: string, goal: string) => void;
  visibleOnMobile?: boolean;
}

const ChatWindow = ({
  messages,
  children,
  title,
  onSave,
  scrollToBottom,
  setAgentRun,
  visibleOnMobile,
}: ChatWindowProps) => {
  const [t] = useTranslation();
  const [hasUserScrolled, setHasUserScrolled] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

    // Use has scrolled if we have scrolled up at all from the bottom
    const hasUserScrolled = scrollTop < scrollHeight - clientHeight - 10;
    setHasUserScrolled(hasUserScrolled);
  };

  useEffect(() => {
    // Scroll to bottom on re-renders
    if (scrollToBottom && scrollRef && scrollRef.current) {
      if (!hasUserScrolled) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  });

  return (
    <div
      className={clsx(
        "border-translucent h-full max-w-[inherit] flex-1 flex-col overflow-auto rounded-2xl border-2 border-white/20 bg-zinc-900 text-white shadow-2xl drop-shadow-lg transition-all duration-500",
        visibleOnMobile ? "flex" : "hidden xl:flex"
      )}
    >
      <MacWindowHeader title={title} messages={messages} onSave={onSave} />
      <div
        className="mb-2 mr-2 flex-1 overflow-auto transition-all duration-500"
        ref={scrollRef}
        onScroll={handleScroll}
        id={messageListId}
      >
        {messages.map((message, index) => {
          if (getTaskStatus(message) === TASK_STATUS_EXECUTING) {
            return null;
          }

          return (
            <FadeIn key={`${index}-${message.type}`}>
              <ChatMessage message={message} />
            </FadeIn>
          );
        })}
        {children}

        {messages.length === 0 && (
          <>
            <PopIn delay={0.8} duration={0.5}>
              <ChatMessage
                message={{
                  type: MESSAGE_TYPE_SYSTEM,
                  value: "👉 " + t("CREATE_AN_AGENT_DESCRIPTION", { ns: "chat" }),
                }}
              />
              <div className="m-2 flex flex-col justify-between gap-2 sm:m-4 sm:flex-row">
                <ExampleAgentButton name="PlatformerGPT 🎮" setAgentRun={setAgentRun}>
                  Write some code to make a platformer game.
                </ExampleAgentButton>
                <ExampleAgentButton name="TravelGPT 🌴" setAgentRun={setAgentRun}>
                  Plan a detailed trip to Hawaii.
                </ExampleAgentButton>
                <ExampleAgentButton name="ResearchGPT 📜" setAgentRun={setAgentRun}>
                  Create a comprehensive report of the Nike company
                </ExampleAgentButton>
              </div>
            </PopIn>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
