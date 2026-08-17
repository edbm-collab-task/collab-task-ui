interface Props {
    onSelect: (emoji: string) => void;
}

const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😂",
    "🤣",
    "😊",
    "🙂",
    "😉",
    "😍",
    "🥰",
    "😘",
    "😎",
    "🤔",
    "😅",
    "😭",
    "😡",
    "👍",
    "👎",
    "👏",
    "🙏",
    "❤️",
    "🔥",
    "🎉",
    "🚀",
    "💯",
    "✅",
    "❌",
    "⭐",
];

const EmojiPicker = ({ onSelect }: Props) => {
    return (
        <div className="absolute bottom-12 left-0 z-30 grid w-64 grid-cols-6 gap-1 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
            {emojis.map((emoji) => (
                <button
                    key={emoji}
                    onClick={() =>
                        onSelect(emoji)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-xl hover:bg-gray-100"
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};

export default EmojiPicker;