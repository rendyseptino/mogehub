"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Heading, Text, Button, HStack, VStack, useToast } from "@chakra-ui/react";
import { isMobileCard } from "../../utils/responsiveCard";
import jwtDecode from "jwt-decode";

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 25;
const CANVAS_WIDTH_DESKTOP = COLS * BLOCK_SIZE;
const CANVAS_HEIGHT_DESKTOP = ROWS * BLOCK_SIZE;
const FALL_INTERVAL = 500;
const API = "https://api.mogehub.com/api/mini-game";

const SHAPES = {
  I: [[[1,1,1,1]],[[1],[1],[1],[1]]],
  O: [[[1,1],[1,1]]],
  T: [[[0,1,0],[1,1,1]],[[1,0],[1,1],[1,0]],[[1,1,1],[0,1,0]],[[0,1],[1,1],[0,1]]],
  S: [[[0,1,1],[1,1,0]],[[1,0],[1,1],[0,1]]],
  Z: [[[1,1,0],[0,1,1]],[[0,1],[1,1],[1,0]]],
  J: [[[1,0,0],[1,1,1]],[[1,1],[1,0],[1,0]],[[1,1,1],[0,0,1]],[[0,1],[0,1],[1,1]]],
  L: [[[0,0,1],[1,1,1]],[[1,0],[1,0],[1,1]],[[1,1,1],[1,0,0]],[[1,1],[0,1],[0,1]]],
};

const COLORS = { I:"#00f0f0", O:"#f0f000", T:"#a000f0", S:"#00f000", Z:"#f00000", J:"#0000f0", L:"#f0a000" };

export default function TetrisPage() {
  const canvasRef = useRef(null);
  const [grid,setGrid] = useState(Array.from({length:ROWS},()=>Array(COLS).fill(0)));
  const [currentPiece,setCurrentPiece] = useState(null);
  const [position,setPosition] = useState({x:3,y:0});
  const [rotation,setRotation] = useState(0);
  const [score,setScore] = useState(0);
  const [highScore,setHighScore] = useState(0);
  const [gameOver,setGameOver] = useState(false);
  const [running,setRunning] = useState(false);
  const [userId,setUserId] = useState(null);
  const [leaderboard,setLeaderboard] = useState([]);
  const toast = useToast();

  const isMobile = isMobileCard();
  const canvasWidth = typeof window !== "undefined" ? (isMobile ? window.innerWidth - 40 : CANVAS_WIDTH_DESKTOP) : CANVAS_WIDTH_DESKTOP;
  const canvasHeight = typeof window !== "undefined" ? (isMobile ? window.innerHeight * 0.6 : CANVAS_HEIGHT_DESKTOP) : CANVAS_HEIGHT_DESKTOP;

  // ================= GET USER ID FROM JWT =================
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "Login dulu bro!", status: "error" });
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.id);
      fetchLeaderboard(decoded.id);
      fetchUserHighScore(decoded.id);
      spawnPiece();
      setRunning(true);
    } catch (err) {
      console.error("JWT decode error:", err);
      toast({ title: "Token invalid. Login lagi bro!", status: "error" });
    }
  }, []);

  // ================= FETCH LEADERBOARD =================
  const fetchLeaderboard = async(uid) => {
    try {
      const res = await fetch(`${API}/leaderboard?game=tetrisLegend&limit=10`);
      const data = await res.json();
      setLeaderboard(data);
    } catch(err){ console.error(err); }
  };

  // ================= FETCH USER HIGHSCORE =================
  const fetchUserHighScore = async(uid) => {
    try {
      const res = await fetch(`${API}/user-highscore?game=tetrisLegend`, {
        headers: { "x-user-id": uid },
      });
      const data = await res.json();
      setHighScore(data.score || 0);
    } catch(err){ console.error(err); }
  };

  // ================= TETRIS LOGIC =================
  const randomPiece = () => { 
    const types = Object.keys(SHAPES); 
    const type = types[Math.floor(Math.random()*types.length)]; 
    return { type, shape: SHAPES[type] }; 
  }

  const isValidMove = (piece,x,y,rot) => {
    const shape = piece.shape[rot % piece.shape.length];
    for(let r=0;r<shape.length;r++)
      for(let c=0;c<shape[r].length;c++)
        if(shape[r][c]){
          const newX = x+c, newY = y+r;
          if(newX<0||newX>=COLS||newY>=ROWS) return false;
          if(grid[newY][newX]) return false;
        }
    return true;
  };

  const placePiece = () => {
    const shape = currentPiece.shape[rotation % currentPiece.shape.length];
    const newGrid = grid.map(row=>[...row]);
    shape.forEach((r,ri)=> r.forEach((c,ci)=> { if(c) newGrid[position.y+ri][position.x+ci] = currentPiece.type; }));
    let cleared = 0;
    for(let r=ROWS-1; r>=0; r--) {
      if(newGrid[r].every(cell=>cell!==0)) { newGrid.splice(r,1); newGrid.unshift(Array(COLS).fill(0)); cleared++; r++; }
    }
    if(cleared) setScore(prev=>prev+cleared*10);
    setGrid(newGrid);
    spawnPiece();
  };

  const spawnPiece = () => {
    const piece = randomPiece();
    setCurrentPiece(piece);
    setPosition({x:3,y:0});
    setRotation(0);
    if(!isValidMove(piece,3,0,0)){ setGameOver(true); setRunning(false); submitScore(); }
  };

  const moveDown = () => {
    if(isValidMove(currentPiece,position.x,position.y+1,rotation)) setPosition(p=>({...p,y:p.y+1}));
    else placePiece();
  };

  // ================= GAME LOOP =================
  useEffect(()=>{
    if(!running || !currentPiece) return;
    const interval = setInterval(()=>{ if(!gameOver) moveDown(); }, FALL_INTERVAL);
    return ()=>clearInterval(interval);
  },[currentPiece,position,rotation,grid,running,gameOver]);

  // ================= KEY HANDLER DESKTOP =================
  useEffect(()=>{
    if(isMobile) return;
    const handleKey=(e)=>{if(!currentPiece||gameOver||!running)return;
      switch(e.key){
        case "ArrowLeft": if(isValidMove(currentPiece,position.x-1,position.y,rotation)) setPosition(p=>({...p,x:p.x-1})); break;
        case "ArrowRight": if(isValidMove(currentPiece,position.x+1,position.y,rotation)) setPosition(p=>({...p,x:p.x+1})); break;
        case "ArrowDown": moveDown(); break;
        case "ArrowUp": const newRot=(rotation+1)%currentPiece.shape.length; if(isValidMove(currentPiece,position.x,position.y,newRot)) setRotation(newRot); break;
      }
    }
    window.addEventListener("keydown",handleKey);
    return ()=>window.removeEventListener("keydown",handleKey);
  },[currentPiece,position,rotation,grid,gameOver,running]);

  // ================= DRAW =================
  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#111"; ctx.fillRect(0,0,canvas.width,canvas.height);
    grid.forEach((row,y)=>row.forEach((cell,x)=>{
      if(cell){ ctx.fillStyle=COLORS[cell]; ctx.fillRect(x*BLOCK_SIZE,y*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE); ctx.strokeStyle="#000"; ctx.strokeRect(x*BLOCK_SIZE,y*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE); }
    }));
    if(currentPiece){
      const shape=currentPiece.shape[rotation%currentPiece.shape.length];
      shape.forEach((r,ri)=> r.forEach((c,ci)=> {
        if(c){
          const x=position.x+ci, y=position.y+ri;
          ctx.fillStyle=COLORS[currentPiece.type];
          ctx.fillRect(x*BLOCK_SIZE,y*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
          ctx.strokeStyle="#000";
          ctx.strokeRect(x*BLOCK_SIZE,y*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
        }
      }));
    }
  },[grid,currentPiece,position,rotation]);

  // ================= SUBMIT SCORE =================
  const submitScore = async()=>{
    try {
      if(!userId) return;
      const existingScore = leaderboard.find(l=>l.user.id===userId)?.score || 0;
      if(score > existingScore){
        await fetch(`${API}/submit`, {
          method:"POST",
          headers:{"Content-Type":"application/json","x-user-id":userId},
          body:JSON.stringify({game:"tetrisLegend",score})
        });
        toast({title:"Score submitted!",status:"success"});
        fetchLeaderboard(userId);
        fetchUserHighScore(userId);
      } else {
        toast({title:"Your score is lower than your highscore",status:"info"});
      }
    } catch(err){ console.error(err); toast({title:"Failed to submit score",status:"error"});}
  };

  // ================= RESTART =================
  const restartGame = () => {
    setGrid(Array.from({length:ROWS},()=>Array(COLS).fill(0)));
    setScore(0);
    setGameOver(false);
    spawnPiece();
    setRunning(true);
  };

  // ================= MOBILE BUTTON HANDLER =================
  const handleMobileMove = (dir) => {
    if(!currentPiece||!running) return;
    if(dir==="left" && isValidMove(currentPiece,position.x-1,position.y,rotation)) setPosition(p=>({...p,x:p.x-1}));
    if(dir==="right" && isValidMove(currentPiece,position.x+1,position.y,rotation)) setPosition(p=>({...p,x:p.x+1}));
    if(dir==="down") moveDown();
    if(dir==="rotate") setRotation((rotation+1)%currentPiece.shape.length);
  };

  return (
    <Box p={4}>
      <Heading mb={2}>Tetris Legend 🎮</Heading>
      <Text mb={2}>Score: {score}</Text>

      <HStack justifyContent="center" mb={2} spacing={4}>
        <Button fontSize="2xl" onClick={()=>setRunning(true)}>▶️</Button>
        <Button fontSize="2xl" onClick={()=>setRunning(false)}>⏸️</Button>
        <Button fontSize="2xl" onClick={()=>{setRunning(false); setGameOver(true); submitScore();}}>🏁</Button>
      </HStack>

      {!isMobile && !gameOver &&
        <HStack justifyContent="center" mb={2} spacing={2}>
          <Text>Use keyboard to play: </Text>
          <Text>⬅️</Text><Text>⬆️</Text><Text>⬇️</Text><Text>➡️</Text>
        </HStack>
      }

      <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} style={{border:"2px solid #000", display:"block", margin:"0 auto", backgroundColor:"#111"}}/>

      {isMobile && !gameOver &&
        <VStack mt={2} spacing={2} align="center">
          <HStack>
            <Button onClick={()=>handleMobileMove("left")}>⬅️</Button>
            <Button onClick={()=>handleMobileMove("rotate")}>🔄</Button>
            <Button onClick={()=>handleMobileMove("right")}>➡️</Button>
          </HStack>
          <Button onClick={()=>handleMobileMove("down")}>⬇️ Drop</Button>
        </VStack>
      }

      {gameOver && <Box mt={4} textAlign="center"><Heading size="md" mb={2}>Game Over!</Heading><Button onClick={restartGame}>Restart</Button></Box>}

      <Box mt={6}>
        <Heading size="md" mb={2}>Leaderboard (Top 10)</Heading>
        {leaderboard.length===0 && <Text>No scores yet.</Text>}
        <ol>
          {leaderboard.map(l=><li key={l.id}>{l.user.username} - {l.score}</li>)}
        </ol>
      </Box>
    </Box>
  );
}