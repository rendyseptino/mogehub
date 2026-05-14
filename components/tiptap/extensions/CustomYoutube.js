import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { IconButton } from "@chakra-ui/react";
import { IconPlayerPlay } from "@tabler/icons-react";
import React, { useRef, useEffect, useState } from "react";

export const extractYoutubeId = (url) => {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.+&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const CustomYoutube = Node.create({
  name: "customYoutube",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      videoId: { default: null },
      thumbnail: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "div.youtube-embed" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ class: "youtube-embed", ...HTMLAttributes })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(({ node }) => {
      const { videoId, thumbnail } = node.attrs;
      const iframeRef = useRef(null);
      const [isPlaying, setIsPlaying] = useState(false);

      const handlePlay = () => {
        if (!videoId) return;
        if (isPlaying) return;

        const autoplay = window.innerWidth < 768 ? 1 : 1; // mobile & desktop
        const mute = window.innerWidth < 768 ? 1 : 0; // mobile muted 1, desktop sound 0

        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}&mute=${mute}&rel=0`;
        iframe.allow = "autoplay; encrypted-media; clipboard-write; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.style.position = "absolute";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.top = "0";
        iframe.style.left = "0";

        iframeRef.current.innerHTML = "";
        iframeRef.current.appendChild(iframe);
        setIsPlaying(true);
      };

      return (
        <NodeViewWrapper
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "56.25%",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {!isPlaying && (
            <>
              <img
                src={thumbnail || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
                alt="YouTube Thumbnail"
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  top: 0,
                  left: 0,
                  objectFit: "cover",
                }}
              />
              <IconButton
                icon={<IconPlayerPlay color="#000000" size={36} />}
                onClick={handlePlay}
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                bg="#ceff00"
                borderRadius="full"
                _hover={{ bg: "#b3ff00" }}
                _active={{ bg: "#a0ff00" }}
                aria-label="Play YouTube"
                width="64px"
                height="64px"
              />
            </>
          )}
          <div ref={iframeRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
        </NodeViewWrapper>
      );
    });
  },

  addCommands() {
    return {
      setCustomYoutube:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name, attrs });
        },
    };
  },
});

export default CustomYoutube;