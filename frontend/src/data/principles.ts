export interface Principle {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    actionable_advice: string;
    color: string;
}

export const PRINCIPLES: Principle[] = [
    {
        id: "eat-the-frog",
        title: "Eat the Frog",
        subtitle: "Tackle your worst task first",
        description: "Mark Twain infamously noted that if the first thing you do each morning is to eat a live frog, you can go through the day with the satisfaction of knowing that it is probably the worst thing that is going to happen to you all day. In Systems Architecture, your 'frog' is your hardest, most critical execution node.",
        actionable_advice: "Identify your Absolute Priority 1 Epic constraint the night before. Deploy it exclusively inside the very first Deep Work computation slot the next day.",
        color: "emerald"
    },
    {
        id: "eisenhower-matrix",
        title: "Eisenhower Matrix",
        subtitle: "Urgent vs. Important Mapping",
        description: "A framework prioritizing objects natively by urgency and importance, parsing them into 4 distinct quadrants: Do first (Urgent & Important), Schedule (Important, Not Urgent), Delegate (Urgent, Not Important), and Don't Do (Neither).",
        actionable_advice: "Filter the noisy 'Urgent but Not Important' objects directly onto external nodes (Stakeholders) using the 'Blocked / Delegate' logic to defend your architectural Deep Work pipeline.",
        color: "blue"
    },
    {
        id: "pareto-principle",
        title: "Pareto Principle (80/20 Rule)",
        subtitle: "Focus strictly on the vital few",
        description: "The 80/20 benchmark dictates that 80% of aggregate outcomes originate from merely 20% of variables. In software engineering natively, 80% of infrastructural performance bottlenecks are caused by 20% of the active logic tree, and 80% of total product value derives from 20% of feature sets.",
        actionable_advice: "Isolate the exact 20% of algorithmic tasks in your active queue that will yield 80% of system stability. Suppress the background noise indefinitely until Minimum Viable Product ships.",
        color: "amber"
    },
    {
        id: "parkinsons-law",
        title: "Parkinson's Law",
        subtitle: "Computational bloat fills allocated bounds",
        description: "Work expands proportionally to fill the absolute temporal space allocated for its execution. If you assign an entire sprint to finalize a dual-hour module sequence, the psychological and algorithmic complexity will artificially escalate strictly to consume that exact sprint capacity.",
        actionable_advice: "Impose artificially stringent, deterministic external_deadlines directly onto your Projects. Let Gemini's aggressive planner enforce hyper-efficient resolutions.",
        color: "rose"
    }
];
