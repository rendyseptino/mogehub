"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Badge,
  Spinner,
  useToast,
  Divider,
  SimpleGrid,
  Image,
  IconButton,
  useColorMode,
  useColorModeValue,
  Textarea,
  Wrap,
  WrapItem,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { FaPaperPlane, FaTrash, FaChevronDown } from "react-icons/fa";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };


const SUBJECT_OPTIONS = [
  { key: "payment", value: "Payment" },
  { key: "product_ads", value: "Iklan Product" },
  { key: "banner_ads", value: "Iklan Banner" },
  { key: "subscription", value: "Paket Subscription" },
  { key: "boost", value: "Paket Boost" },
  { key: "others", value: "Others" },
];


const PRIORITY_OPTIONS = [
  { key: "low", value: "LOW", color: "green.400" },
  { key: "medium", value: "MEDIUM", color: "yellow.400" },
  { key: "high", value: "HIGH", color: "red.400" },
];

export default function SupportTicketPage() {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { language } = useLanguageContext();
  const t = translations[language] || translations.id;
  
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  const chatEndRef = useRef(null);

  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const [attachments, setAttachments] = useState([]);
  const fileRef = useRef(null);

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const s = io(backendUrl, {
      auth: { tokenUserId: user.id },
    });

    setSocket(s);
    return () => s.disconnect();
  }, [user]);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/support-ticket`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      setTickets(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchTickets();
  }, [user]);

  const createTicket = async () => {
    try {

      if (!subject) {
      return toast({
        title: t.support_ticket.validation.subject_required,
        status: "warning",
      });
    }

    if (subject === "payment" && !reference) {
      return toast({
        title: t.support_ticket.validation.reference_required,
        status: "warning",
      });
    }

    if (!message.trim()) {
  return toast({
    title: t.support_ticket.validation.message_required,
    status: "warning",
  });
}


      const formData = new FormData();

      formData.append(
        "subject",
        subject === "others" ? customSubject : subject
      );

      formData.append("priority", priority);
      formData.append("message", message);

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await fetch(`${backendUrl}/api/support-ticket`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();
      setTickets([data, ...tickets]);

      toast({ title: t.support_ticket.toast.success_create, status: "success" });

      setMessage("");
      setCustomSubject("");
      setAttachments([]);
    } catch {
      toast({ title:  t.support_ticket.toast.error_create, status: "error" });
    }
  };

  const openTicket = (ticket) => {
    setSelectedTicket(ticket);
    setChatMessages(ticket.messages || []);

    socket?.emit("joinTicket", ticket.id);
    socket?.off("ticketMessage");

    socket?.on("ticketMessage", (msg) => {
      if (msg.ticketId === ticket.id) {
        setChatMessages((prev) => [...prev, msg]);
      }
    });
  };

  const sendMessage = async () => {
    if (!chatInput) return;

    const formData = new FormData();
    formData.append("ticketId", selectedTicket.id);
    formData.append("message", chatInput);

    attachments.forEach((f) => formData.append("attachments", f));

    const res = await fetch(`${backendUrl}/api/support-ticket/message`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    const data = await res.json();

    setChatMessages((p) => [...p, data]);
    setChatInput("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  if (loading) {
    return (
      <Flex h="200px" align="center" justify="center">
        <Spinner />
      </Flex>
    );
  }

  return (
  <Box p={6}>

    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>

      {/* LEFT */}
      <Box>

        {/* CREATE CARD */}
        <Box p={5} borderWidth="1px" borderRadius="2xl">

          {/* LOGO */}
          <HStack mb={4}>
            <Image
              src={
                colorMode === "light"
                  ? "/mogehubmasterlight.png"
                  : "/mogehubmasterdark.png"
              }
              w="120px"
            />
          </HStack>

          <Text fontWeight="bold" mb={5}>
            {t.support_ticket.title}
          </Text>

          <Divider my={4} />

          <Text fontSize="sm" mb={2} fontWeight="bold">
           {t.support_ticket.choose_subject}
          </Text>

          {/* SUBJECT */}
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<FaChevronDown />}
              mb={3}
              w={{ base: "full", md: "auto" }}   // ✅ FIX desktop NOT full width
              textAlign="left"
              justifyContent="space-between"
            >
              <Text textAlign="left">
                {subject
                  ? t.support_ticket.subject_options[subject]
                  : t.support_ticket.select_subject}
              </Text>
            </MenuButton>

            <MenuList>
              {SUBJECT_OPTIONS.map((s) => (
              <MenuItem
                key={s.key}
                onClick={() => setSubject(s.key)}
              >
                {t.support_ticket.subject_options[s.key]}
              </MenuItem>
            ))}
            </MenuList>
          </Menu>

          {subject === "others" && (
            <Input
              placeholder={t.support_ticket.custom_subject_placeholder}
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              mb={4}
              mt={1}
            />
          )}

          {/* 🔥 PAYMENT REFERENCE */}
          {subject === "payment" && (
            <>
              <Input
                placeholder={t.support_ticket.reference_placeholder}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                mb={1}
              />

              <Text
                fontSize="sm"
                color={useColorModeValue("gray.600", "gray.400")}
                mb={4}
              >
                {t.support_ticket.reference_help}
              </Text>
            </>
          )}

          <Divider my={4} />
          {/* PRIORITY */}
          <Text fontSize="sm" mb={2} fontWeight="bold">
              {t.support_ticket.priority_label}

          </Text>

          <HStack mb={5} spacing={3} flexWrap="wrap">
            {PRIORITY_OPTIONS.map((p) => (
            <Badge
              key={p.value}
              px={3}
              py={1}
              borderRadius="full"
              cursor="pointer"
              bg={priority === p.value ? p.color : "gray.200"}
              color={priority === p.value ? "black" : "gray.600"}
              onClick={() => setPriority(p.value)}
            >
              {t.support_ticket.priority[p.key]}
            </Badge>
          ))}
          </HStack>

          {/* MESSAGE */}
          <Textarea
  placeholder={t.support_ticket.message_placeholder}
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  mb={5}
  minH="140px"         
  resize="vertical"     
  borderRadius="lg"     
/>

         {/* FILE UPLOAD */}
<Input
  type="file"
  multiple
  hidden
  ref={fileRef}
  onChange={(e) =>
    setAttachments([...attachments, ...Array.from(e.target.files)])
  }
/>

<Box mb={4}>

  <Flex
  direction="column"
  w="full"
  align={{ base: "stretch", md: "flex-start" }}
  gap={{ base: 3, md: 4 }}
>
    {/* CHOOSE FILE */}
    <Button
  onClick={() => fileRef.current.click()}
  variant="outline"
  h={{ base: "42px", md: "46px" }}
  px={6}
  w="full"              // 🔥 MOBILE AUTO FULL
  maxW={{ md: "180px" }} // 🔥 DESKTOP LIMIT WIDTH
  alignSelf={{ base: "stretch", md: "flex-start" }}
>
  {t.support_ticket.choose_file}
</Button>

    {/* CREATE BUTTON */}
    <Button
  mt={{ base: 3, md: 6 }}
  bg="brand.500"
  color="black"
  leftIcon={<FaPaperPlane />}
  onClick={createTicket}
  h={{ base: "42px", md: "46px" }}
  px={6}
  w={{ base: "full", md: "180px" }}
  alignSelf={{ base: "stretch", md: "flex-end" }}
>
  {t.support_ticket.create_ticket}
</Button>

  </Flex>

</Box>
          {/* ATTACHMENT PREVIEW */}
          <Wrap mb={2}>
            {attachments.map((f, i) => (
              <WrapItem key={i}>
                <Box position="relative">
                  <Image
                    src={URL.createObjectURL(f)}
                    boxSize="60px"
                    borderRadius="md"
                  />
                  <IconButton
                    icon={<FaTrash />}
                    size="xs"
                    position="absolute"
                    top="0"
                    right="0"
                    onClick={() =>
                      setAttachments(
                        attachments.filter((_, x) => x !== i)
                      )
                    }
                  />
                </Box>
              </WrapItem>
            ))}
          </Wrap>

        </Box>

        {/* LIST */}
        <VStack mt={4} align="stretch">
          {tickets.map((t) => (
            <Box
              key={t.id}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              cursor="pointer"
              onClick={() => openTicket(t)}
            >
              <Text fontWeight="bold">{t.subject}</Text>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* CHAT */}
      <Box
        borderWidth="1px"
        borderRadius="2xl"
        p={4}
        h="600px"
        display="flex"
        flexDir="column"
      >
        {selectedTicket ? (
          <>
            <Heading size="sm">{selectedTicket.subject}</Heading>
            <Divider my={3} />

            <Box flex="1" overflowY="auto">
              {chatMessages.map((m, i) => (
                <Box
                  key={i}
                  mb={2}
                  p={2}
                  bg="gray.50"
                  borderRadius="md"
                >
                  <Text fontSize="sm">{m.message}</Text>
                </Box>
              ))}
              <div ref={chatEndRef} />
            </Box>

            <HStack mt={3}>
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <Button
                bg="brand.500"
                color="black"
                leftIcon={<FaPaperPlane />}
                onClick={sendMessage}
              >
                Send
              </Button>
            </HStack>
          </>
        ) : (
          <Flex h="full" align="center" justify="center">
            <Text>Select ticket</Text>
          </Flex>
        )}
      </Box>

    </SimpleGrid>
  </Box>
);
}