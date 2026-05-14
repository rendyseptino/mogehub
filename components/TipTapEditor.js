"use client";

import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import YoutubeModal from "@/components/tiptap/modals/YoutubeModal";
import ImageModal from "@/components/tiptap/modals/ImageModal";
import LinkModal from "@/components/tiptap/modals/LinkModal";

import { useEffect, useRef, useState } from "react";

import {
  Box,
  Button,
  HStack,
  Divider,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  Flex,
} from "@chakra-ui/react";

import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconLink,
  IconPhoto,
  IconBrandYoutube,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconH1,
  IconH2,
  IconH3,
  IconPencil,
} from "@tabler/icons-react";

export default function TipTapEditor({
  content,
  onUpdate,
  placeholder = "Tulis sesuatu...",
}) {
  const toolbarBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const isFirstLoad = useRef(true);
  const [manualColor, setManualColor] = useState("#000000");
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");

  const editor = useEditor({
     immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder,
      }),
      Youtube.configure({
        inline: false,
        controls: true,
        width: 640,
        height: 360,
      }),
    ],
    editorProps: {
      attributes: {
        style: "white-space: pre-wrap; word-break: break-word;",
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
  });

  const handleInsertYoutube = (url) => {
  editor.chain().focus().setYoutubeVideo({ src: url }).run();
};

const handleInsertImage = (url) => {
  editor.chain().focus().setImage({ src: url }).run();
};

const handleInsertLink = (url) => {
  if (!selectedText) return;

  editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
};

  useEffect(() => {
    if (!editor) return;
    if (isFirstLoad.current && content) {
      editor.commands.setContent(content);
      isFirstLoad.current = false;
    }
  }, [editor, content]);

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      const ed = ctx.editor;
      if (!ed)
        return {
          canUndo: false,
          canRedo: false,
          isH1: false,
          isH2: false,
          isH3: false,
          isBold: false,
          isItalic: false,
          isUnderline: false,
          isLink: false,
        };

      return {
        canUndo: ed.can().undo(),
        canRedo: ed.can().redo(),
        isH1: ed.isActive("heading", { level: 1 }),
        isH2: ed.isActive("heading", { level: 2 }),
        isH3: ed.isActive("heading", { level: 3 }),
        isBold: ed.isActive("bold"),
        isItalic: ed.isActive("italic"),
        isUnderline: ed.isActive("underline"),
        isLink: ed.isActive("link"),
      };
    },
  });

  if (!editor) return null;

  

  const handleColorChange = (color) => {
    editor.chain().focus().setColor(color).run();
  };

  const resetColor = () => {
    editor.chain().focus().unsetColor().run();
    setManualColor("#000000");
  };

  return (
    <Box border="1px solid" borderColor={borderColor} rounded="md">
      <HStack
        spacing={1}
        wrap="wrap"
        p={2}
        borderBottom="1px solid"
        borderColor={borderColor}
        bg={toolbarBg}
      >
        {/* Undo / Redo */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          isDisabled={!editorState.canUndo}
        >
          <IconArrowBackUp size={18} />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          isDisabled={!editorState.canRedo}
        >
          <IconArrowForwardUp size={18} />
        </Button>

        <Divider orientation="vertical" h="24px" />

        {/* Headings */}
        <Button
          size="sm"
          variant={editorState.isH1 ? "solid" : "ghost"}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <IconH1 size={18} />
        </Button>

        <Button
          size="sm"
          variant={editorState.isH2 ? "solid" : "ghost"}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <IconH2 size={18} />
        </Button>

        <Button
          size="sm"
          variant={editorState.isH3 ? "solid" : "ghost"}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <IconH3 size={18} />
        </Button>

        <Divider orientation="vertical" h="24px" />

        {/* Formatting */}
        <Button
          size="sm"
          variant={editorState.isBold ? "solid" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <IconBold size={18} />
        </Button>

        <Button
          size="sm"
          variant={editorState.isItalic ? "solid" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <IconItalic size={18} />
        </Button>

        <Button
          size="sm"
          variant={editorState.isUnderline ? "solid" : "ghost"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <IconUnderline size={18} />
        </Button>

        <Button
        size="sm"
        variant={editorState.isLink ? "solid" : "ghost"}
        onClick={() => {
          const selection = editor?.state?.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
            " "
          );

          setSelectedText(selection || "");
          setLinkOpen(true);
        }}
      >
        <IconLink size={18} />
      </Button>

        <Button size="sm" variant="ghost" onClick={() => setImageOpen(true)}>
        <IconPhoto size={18} />
      </Button>

        <Button size="sm" variant="ghost" onClick={() => setYoutubeOpen(true)}>
          <IconBrandYoutube size={18} />
        </Button>

        <Divider orientation="vertical" h="24px" />

        {/* Color Picker */}
        <Menu>
          <MenuButton
            as={Button}
            size="sm"
            variant="ghost"
            title="Pilih warna teks"
          >
            <IconPencil size={18} />
          </MenuButton>
          <MenuList minW="150px">
            {["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFA500"].map(
              (color) => (
                <MenuItem
                  key={color}
                  onClick={() => handleColorChange(color)}
                >
                  <Box
                    w="20px"
                    h="20px"
                    bg={color}
                    borderRadius="full"
                    mr={2}
                  />
                  {color}
                </MenuItem>
              )
            )}
            <Divider />
            <Flex px={3} py={2} align="center">
              <Input
                size="sm"
                type="color"
                value={manualColor}
                onChange={(e) => setManualColor(e.target.value)}
                mr={2}
              />
              <Button
                size="sm"
                onClick={() => handleColorChange(manualColor)}
              >
                Apply
              </Button>
            </Flex>
            <MenuItem onClick={resetColor}>Reset</MenuItem>
          </MenuList>
        </Menu>
      </HStack>

      <Box
        px={3}
        py={3}
        minH="200px"
        cursor="text"
        onClick={() => editor.chain().focus().run()}
        sx={{
          "& .ProseMirror": {
            outline: "none",
            minHeight: "160px",
          },
          "& .ProseMirror p": {
            margin: "0 0 8px 0",
          },
          "& .ProseMirror h1": {
            fontSize: "2xl",
            fontWeight: "bold",
            margin: "0 0 12px 0",
          },
          "& .ProseMirror h2": {
            fontSize: "xl",
            fontWeight: "bold",
            margin: "0 0 10px 0",
          },
          "& .ProseMirror h3": {
            fontSize: "lg",
            fontWeight: "bold",
            margin: "0 0 8px 0",
          },

          /* =========================
             FIX YOUTUBE RESPONSIVE
             ========================= */

          "& .ProseMirror [data-youtube-video]": {
            position: "relative",
            paddingBottom: "56.25%",
            height: 0,
            overflow: "hidden",
            maxWidth: "100%",
            margin: "12px 0",
            borderRadius: "8px",
          },

          "& .ProseMirror [data-youtube-video] iframe": {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            border: 0,
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      <Divider />
      <Box mb={6} />
      
      <YoutubeModal
  isOpen={youtubeOpen}
  onClose={() => setYoutubeOpen(false)}
  onSubmit={handleInsertYoutube}
/>

<ImageModal
  isOpen={imageOpen}
  onClose={() => setImageOpen(false)}
  onSubmit={handleInsertImage}
/>

<LinkModal
  isOpen={linkOpen}
  onClose={() => setLinkOpen(false)}
  onSubmit={handleInsertLink}
  selectedText={selectedText}
/>

    </Box>
  );
}