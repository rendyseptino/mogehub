"use client";
import Head from "next/head";
import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  VStack,
  useColorMode,
  Container,
  SimpleGrid,
  Center
} from "@chakra-ui/react";

import { keyframes } from "@emotion/react";
import { useRouter } from "next/router";
import { useRef, useEffect } from "react";
import NextImage from "next/image";
import { useUser } from "@/context/UserContext";
import Footer from "../components/Footer";
import { useLanguageContext } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import id from "@/locales/id.json";
const translations = { en, id };

/* ================= ANIMATION ================= */

const slideDown = keyframes`
0%{
opacity:0;
transform:translateY(-40px);
}
100%{
opacity:1;
transform:translateY(0);
}
`;

const fadeUp = keyframes`
0%{
opacity:0;
transform:translateY(20px);
}
100%{
opacity:1;
transform:translateY(0);
}
`;

const slideAnim = `${slideDown} 0.8s ease-out`;

export default function AboutPage() {

const { colorMode } = useColorMode();
const router = useRouter();
const { language } = useLanguageContext();
const t = translations[language] || translations.id;
const pageTitle =
  language === "en"
    ? "About - MogeHub"
    : "Tentang - MogeHub";


const pageBg = colorMode === "light" ? "gray.50" : "gray.900";
const sectionBg = colorMode === "light" ? "white" : "gray.800";
const textMain = colorMode === "light" ? "gray.700" : "gray.200";
const muted = colorMode === "light" ? "gray.500" : "gray.400";
const borderColor = colorMode === "light" ? "gray.200" : "gray.700";

const { user, loading } = useUser(); // ambil user context

const handleJoin = () => {
  if (loading) return; // tunggu context siap

  const token = localStorage.getItem("token");

  if (user || token) {
    router.push("/seller/dashboard"); // langsung ke dashboard kalo udah login
  } else {
    router.push("/login"); // belum login, redirect ke login
  }
};
const handleForum = () => router.push("/forum");

return (

<Box minH="100vh" bg={pageBg}>

   <Head>
    <title>{pageTitle}</title>
  </Head>

{/* HERO */}

<Box pt={{ base:16, lg:24 }} pb={{ base:20, lg:28 }}>

<Container maxW="1100px">

<Flex direction={{ base:"column", lg:"row" }} align="center" gap={{ base:12, lg:16 }}>

<Box flex="1">

<Text fontSize={{ base:"3xl", md:"4xl" }} fontWeight="bold" mb={4} color={textMain}>
{t.aboutHeroTitle}
</Text>

<Text fontSize={{ base:"md", md:"lg" }} mb={8} color={muted} maxW="560px" lineHeight="1.8">
{t.aboutHeroDesc}
</Text>

<HStack spacing={4} flexWrap="wrap">

<Button rounded="full" bg="brand.500" color="black" _hover={{ bg:"brand.600" }} onClick={handleForum}>
{t.exploreForum}
</Button>

<Button rounded="full" variant="outline"
onClick={()=>document.getElementById("about-story")?.scrollIntoView({behavior:"smooth"})}>
{t.learnMore}
</Button>

</HStack>

</Box>

<Box
  flex="1"
  animation={slideAnim}
  w="100%"
>
  <Box
    position="relative"
    w="100%"
    h={{ base: "320px", md: "420px" }}
    rounded="xl"
    overflow="hidden"
    boxShadow="2xl"
  >
    <NextImage
      src="/aboutmogehub.png"
      alt="MogeHub Community"
      fill
      priority
      unoptimized
      style={{
        objectFit: "cover",
      }}
    />
  </Box>
</Box>
</Flex>

</Container>

</Box>

{/* OUR STORY */}

<Box id="about-story" bg={sectionBg} py={{ base:14, lg:20 }} borderTop="1px solid" borderColor={borderColor}>

<Container maxW="900px">

<VStack spacing={6} textAlign="center">

<Text fontSize={{ base:"2xl", md:"3xl" }} fontWeight="bold" color={textMain}>
{t.ourStory}
</Text>

<Text color={muted} fontSize={{ base:"md", md:"lg" }} lineHeight="1.9">
{t.ourStoryDesc}
</Text>

</VStack>

</Container>

</Box>

{/* FEATURES */}

<Box py={{ base:14, lg:20 }}>

<Container maxW="1100px">

<Text fontSize={{ base:"xl", md:"2xl" }} fontWeight="bold" mb={10} color={textMain}>
{t.whatYouCanDo}
</Text>

<SimpleGrid columns={{ base:1, md:2, lg:4 }} spacing={6}>

<FeatureCard title={t.feature1Title} desc={t.feature1Desc}/>
<FeatureCard title={t.feature2Title} desc={t.feature2Desc}/>
<FeatureCard title={t.feature3Title} desc={t.feature3Desc}/>
<FeatureCard title={t.feature4Title} desc={t.feature4Desc}/>

</SimpleGrid>

</Container>

</Box>

{/* VISION */}

<Box bg={sectionBg} py={{ base:14, lg:20 }} borderTop="1px solid" borderColor={borderColor}>

<Container maxW="900px">

<VStack spacing={6} textAlign="center">

<Text fontSize={{ base:"2xl", md:"3xl" }} fontWeight="bold" color={textMain}>
{t.ourVision}
</Text>

<Text color={muted} fontSize={{ base:"md", md:"lg" }} lineHeight="1.9">
{t.visionDesc}
</Text>

</VStack>

</Container>

</Box>

{/* MISSION */}

<Box py={{ base:20, lg:24 }} position="relative" overflow="hidden" bg="gray.900">

<NetworkBackground/>

<Container maxW="1100px" position="relative" zIndex="2">

<Text fontSize={{ base:"xl", md:"2xl" }} fontWeight="bold" mb={10} color="white">
{t.ourMission}
</Text>

<SimpleGrid columns={{ base:1, md:2 }} spacing={6}>

<MissionCard text={t.mission1} delay={0}/>
<MissionCard text={t.mission2} delay={0.2}/>
<MissionCard text={t.mission3} delay={0.4}/>
<MissionCard text={t.mission4} delay={0.6}/>

</SimpleGrid>

</Container>

</Box>

{/* CTA */}

<Box bg={sectionBg} py={{ base:14, lg:20 }}>

<Container maxW="900px">

<Center>

<VStack spacing={6} textAlign="center">

<Text fontSize={{ base:"2xl", md:"3xl" }} fontWeight="bold" color={textMain}>
{t.readyJoin}
</Text>

<Text color={muted} fontSize={{ base:"md", md:"lg" }} lineHeight="1.9">
{t.readyJoinDesc}
</Text>

<Button rounded="full" size="lg" bg="brand.500" color="black" _hover={{ bg:"brand.600" }} onClick={handleJoin}>
{t.joinMogehub}
</Button>

</VStack>

</Center>

</Container>

</Box>

<Footer />

</Box>

);
}

/* NETWORK BG */

function NetworkBackground(){

const canvasRef = useRef(null);

useEffect(()=>{

const canvas = canvasRef.current;
const ctx = canvas.getContext("2d");

let particles=[];
const particleCount=45;

function resize(){
canvas.width=window.innerWidth;
canvas.height=canvas.parentElement.offsetHeight;
}

resize();
window.addEventListener("resize",resize);

for(let i=0;i<particleCount;i++){
particles.push({
x:Math.random()*canvas.width,
y:Math.random()*canvas.height,
vx:(Math.random()-0.5)*0.4,
vy:(Math.random()-0.5)*0.4
});
}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

particles.forEach((p,i)=>{

p.x+=p.vx;
p.y+=p.vy;

if(p.x<0||p.x>canvas.width) p.vx*=-1;
if(p.y<0||p.y>canvas.height) p.vy*=-1;

ctx.beginPath();
ctx.arc(p.x,p.y,2.4,0,Math.PI*2);
ctx.fillStyle="#ceff00";
ctx.fill();

for(let j=i+1;j<particles.length;j++){

const p2=particles[j];
const dx=p.x-p2.x;
const dy=p.y-p2.y;
const dist=Math.sqrt(dx*dx+dy*dy);

if(dist<120){

ctx.beginPath();
ctx.moveTo(p.x,p.y);
ctx.lineTo(p2.x,p2.y);

ctx.strokeStyle="rgba(206,255,0,0.35)";
ctx.lineWidth=1;
ctx.stroke();

}

}

});

requestAnimationFrame(draw);

}

draw();

return()=>window.removeEventListener("resize",resize);

},[]);

return(
<canvas
ref={canvasRef}
style={{
position:"absolute",
inset:0,
width:"100%",
height:"100%",
zIndex:0
}}
/>
);

}

/* FEATURE CARD */

function FeatureCard({title,desc}){

return(

<Box p={6} borderWidth="1px" rounded="xl">

<Text fontWeight="bold" mb={2}>{title}</Text>

<Text fontSize="sm" color="gray.500">{desc}</Text>

</Box>

);

}

/* MISSION CARD */

function MissionCard({text,delay}){

return(

<Box
p={6}
bg="whiteAlpha.100"
borderWidth="1px"
rounded="xl"
backdropFilter="blur(6px)"
animation={`${fadeUp} 0.8s ease forwards`}
style={{animationDelay:`${delay}s`,opacity:0}}
>

<Text fontSize="sm" color="white">{text}</Text>

</Box>

);

}