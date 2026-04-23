export interface VoiceCommand {
    pattern: RegExp;
    action: (match: RegExpMatchArray) => void;
}

export function processVoiceCommand(text: string, currentViewSetter: (view: any) => void): boolean {
    const lowerText = text.toLowerCase().trim();

    // Define navigation mappings
    const navCommands: Record<string, string> = {
        'dashboard': 'dashboard',
        'eisenhower': 'eisenhower',
        'matrix': 'eisenhower',
        'focus': 'focus',
        'daily': 'focus',
        'projects': 'projects',
        'principles': 'principles',
        'guiding': 'principles',
        'stakeholders': 'stakeholders',
        'people': 'stakeholders',
        'journal': 'interactions',
        'relationships': 'interactions',
        'knowledge': 'knowledge_base',
        'rag': 'knowledge_base',
        'self-mirror': 'self_mirror',
        'traits': 'self_mirror',
        'growth': 'self_mirror',
        'chat': 'chat',
        'advisor': 'chat',
        'strategic': 'chat',
        'settings': 'settings'
    };

    // Navigation logic: "go to [page]" or just "[page]" if it's a primary view
    if (lowerText.includes('go to') || lowerText.includes('navigate to') || lowerText.includes('show me')) {
        for (const [trigger, view] of Object.entries(navCommands)) {
            if (lowerText.includes(trigger)) {
                currentViewSetter(view);
                return true;
            }
        }
    }

    return false;
}
