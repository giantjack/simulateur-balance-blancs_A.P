import { useState, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  VStack,
  HStack,
  Badge,
  Button,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react";

// Préréglages de balance des blancs courants
const WB_PRESETS = [
  { name: "Tungstène", kelvin: 2850, icon: "💡", description: "Ampoules classiques" },
  { name: "Fluorescent", kelvin: 4000, icon: "🔦", description: "Néons, bureaux" },
  { name: "Lumière du jour", kelvin: 5500, icon: "☀️", description: "Soleil de midi" },
  { name: "Flash", kelvin: 5500, icon: "⚡", description: "Flash photo" },
  { name: "Nuageux", kelvin: 6500, icon: "☁️", description: "Ciel couvert" },
  { name: "Ombre", kelvin: 7500, icon: "🏔️", description: "Zone ombragée" },
];

// Convertir température Kelvin en couleur RGB approximative
// Plus la température est basse = lumière chaude (orange)
// Plus la température est haute = lumière froide (bleue)
function kelvinToRgb(kelvin: number): { r: number; g: number; b: number } {
  // Algorithme basé sur la formule de Tanner Helland
  const temp = kelvin / 100;
  let r: number, g: number, b: number;

  // Rouge
  if (temp <= 66) {
    r = 255;
  } else {
    r = temp - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    r = Math.max(0, Math.min(255, r));
  }

  // Vert
  if (temp <= 66) {
    g = temp;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
  } else {
    g = temp - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
  }
  g = Math.max(0, Math.min(255, g));

  // Bleu
  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = temp - 10;
    b = 138.5177312231 * Math.log(b) - 305.0447927307;
    b = Math.max(0, Math.min(255, b));
  }

  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

// Calculer le filtre CSS pour simuler l'effet de la balance des blancs
function getWhiteBalanceFilter(wbKelvin: number, sceneKelvin: number): string {
  // La différence entre la BB réglée et la lumière de la scène
  // détermine la dominante de couleur
  const diff = wbKelvin - sceneKelvin;

  // Convertir la différence en intensité (0 à 1)
  // Diff positif = image plus chaude (orange)
  // Diff négatif = image plus froide (bleue)
  const maxDiff = 4000;
  const normalizedDiff = Math.max(-1, Math.min(1, diff / maxDiff));
  const intensity = Math.abs(normalizedDiff);

  if (Math.abs(diff) < 200) {
    // Presque neutre
    return "none";
  }

  if (normalizedDiff > 0) {
    // Plus chaud : orange/jaune prononcé
    // Combinaison sepia + hue-rotate vers orange + saturation
    const sepia = intensity * 80; // jusqu'à 80% sepia
    const hueShift = intensity * -15; // légère rotation vers orange
    const saturation = 100 + intensity * 40;
    const brightness = 100 + intensity * 5;
    return `sepia(${sepia}%) hue-rotate(${hueShift}deg) saturate(${saturation}%) brightness(${brightness}%)`;
  } else {
    // Plus froid : bleu prononcé
    // hue-rotate vers bleu + saturation + légère désaturation des rouges
    const hueShift = intensity * 45; // rotation vers bleu (positif = bleu)
    const saturation = 100 + intensity * 30;
    const brightness = 100 - intensity * 5;
    // Ajouter un léger sepia inversé via hue-rotate supplémentaire
    return `hue-rotate(${hueShift}deg) saturate(${saturation}%) brightness(${brightness}%)`;
  }
}

function App() {
  const [wbKelvin, setWbKelvin] = useState<number>(5500);
  const [sceneLight, setSceneLight] = useState<number>(5500);

  const isMobile = useBreakpointValue({ base: true, md: false });

  // Couleur de la lumière de la scène
  const sceneLightColor = useMemo(() => {
    const rgb = kelvinToRgb(sceneLight);
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }, [sceneLight]);

  // Filtre pour simuler l'effet de la balance des blancs
  const wbFilter = useMemo(() => {
    return getWhiteBalanceFilter(wbKelvin, sceneLight);
  }, [wbKelvin, sceneLight]);

  // Trouver le preset le plus proche
  const closestPreset = useMemo(() => {
    return WB_PRESETS.reduce((prev, curr) =>
      Math.abs(curr.kelvin - wbKelvin) < Math.abs(prev.kelvin - wbKelvin) ? curr : prev
    );
  }, [wbKelvin]);

  // Slider marks
  const kelvinMarks = isMobile
    ? [2500, 5500, 10000]
    : [2500, 4000, 5500, 6500, 8000, 10000];

  return (
    <Box maxW="900px" mx="auto" p={{ base: 3, md: 6 }}>
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        {/* Aperçu visuel */}
        <Box>
          <Text fontWeight="medium" fontSize="sm" mb={3}>
            Aperçu
          </Text>
          <Box
            position="relative"
            borderRadius="lg"
            overflow="hidden"
            h={{ base: "200px", md: "280px" }}
            bg="gray.200"
          >
            {/* Scène de démonstration */}
            <Box
              position="absolute"
              inset={0}
              filter={wbFilter}
              transition="filter 0.3s ease"
            >
              {/* Ciel */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                h="45%"
                bgGradient="linear(to-b, #87CEEB, #B0E0E6)"
              />
              {/* Soleil/lumière */}
              <Box
                position="absolute"
                top="15%"
                right="20%"
                w={{ base: "40px", md: "60px" }}
                h={{ base: "40px", md: "60px" }}
                borderRadius="full"
                bg={sceneLightColor}
                boxShadow={`0 0 40px 20px ${sceneLightColor}`}
                opacity={0.9}
              />
              {/* Montagnes */}
              <Box
                position="absolute"
                bottom="30%"
                left={0}
                right={0}
                h="25%"
                bg="#6B8E6B"
                clipPath="polygon(0 100%, 15% 30%, 30% 70%, 50% 20%, 70% 60%, 85% 25%, 100% 100%)"
              />
              {/* Prairie */}
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                h="35%"
                bgGradient="linear(to-b, #7CBA5F, #5A9A42)"
              />
              {/* Maison */}
              <Box position="absolute" bottom="25%" left="25%">
                {/* Murs */}
                <Box
                  w={{ base: "50px", md: "70px" }}
                  h={{ base: "35px", md: "50px" }}
                  bg="#F5DEB3"
                />
                {/* Toit */}
                <Box
                  position="absolute"
                  top={{ base: "-18px", md: "-25px" }}
                  left={{ base: "-5px", md: "-7px" }}
                  w={0}
                  h={0}
                  borderLeft={{ base: "30px solid transparent", md: "42px solid transparent" }}
                  borderRight={{ base: "30px solid transparent", md: "42px solid transparent" }}
                  borderBottom={{ base: "20px solid #8B4513", md: "28px solid #8B4513" }}
                />
                {/* Porte */}
                <Box
                  position="absolute"
                  bottom={0}
                  left="50%"
                  transform="translateX(-50%)"
                  w={{ base: "12px", md: "16px" }}
                  h={{ base: "20px", md: "28px" }}
                  bg="#654321"
                />
              </Box>
              {/* Arbre */}
              <Box position="absolute" bottom="25%" right="20%">
                {/* Tronc */}
                <Box
                  w={{ base: "10px", md: "14px" }}
                  h={{ base: "30px", md: "45px" }}
                  bg="#8B4513"
                  mx="auto"
                />
                {/* Feuillage */}
                <Box
                  position="absolute"
                  top={{ base: "-25px", md: "-35px" }}
                  left="50%"
                  transform="translateX(-50%)"
                  w={{ base: "40px", md: "55px" }}
                  h={{ base: "40px", md: "55px" }}
                  borderRadius="full"
                  bg="#228B22"
                />
              </Box>
              {/* Personnage */}
              <Box position="absolute" bottom="27%" left="55%">
                {/* Corps */}
                <Box
                  w={{ base: "15px", md: "20px" }}
                  h={{ base: "25px", md: "35px" }}
                  bg="#4169E1"
                  borderRadius="sm"
                />
                {/* Tête */}
                <Box
                  position="absolute"
                  top={{ base: "-12px", md: "-16px" }}
                  left="50%"
                  transform="translateX(-50%)"
                  w={{ base: "12px", md: "16px" }}
                  h={{ base: "12px", md: "16px" }}
                  borderRadius="full"
                  bg="#FFDAB9"
                />
              </Box>
            </Box>
            {/* Indicateur de lumière */}
            <Badge
              position="absolute"
              top={2}
              left={2}
              colorScheme="blackAlpha"
              fontSize="xs"
            >
              Lumière : {sceneLight}K
            </Badge>
          </Box>
        </Box>

        {/* Sélection de la lumière de la scène */}
        <Box>
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontWeight="medium" fontSize="sm">
              Lumière de la scène (conditions réelles)
            </Text>
            <Badge colorScheme="yellow" fontSize="md" px={2}>
              {sceneLight}K
            </Badge>
          </Flex>
          <SimpleGrid columns={{ base: 3, md: 6 }} spacing={2} mb={4}>
            {WB_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                size="sm"
                variant={sceneLight === preset.kelvin ? "solid" : "outline"}
                colorScheme={sceneLight === preset.kelvin ? "orange" : "gray"}
                onClick={() => setSceneLight(preset.kelvin)}
                fontSize="xs"
                h="auto"
                py={2}
                flexDir="column"
              >
                <Text fontSize="lg">{preset.icon}</Text>
                <Text>{preset.name}</Text>
              </Button>
            ))}
          </SimpleGrid>
        </Box>

        {/* Slider balance des blancs */}
        <Box>
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontWeight="medium" fontSize="sm">
              Réglage balance des blancs (sur l'appareil)
            </Text>
            <HStack>
              <Badge colorScheme="blue" fontSize="md" px={2}>
                {wbKelvin}K
              </Badge>
              <Badge colorScheme="gray" fontSize="sm">
                {closestPreset.icon} {closestPreset.name}
              </Badge>
            </HStack>
          </Flex>
          <Box px={2} pb={8}>
            <Slider
              aria-label="white-balance"
              value={wbKelvin}
              onChange={setWbKelvin}
              min={2000}
              max={10000}
              step={100}
            >
              {kelvinMarks.map((mark) => (
                <SliderMark
                  key={mark}
                  value={mark}
                  mt={2}
                  ml={mark >= 10000 ? -4 : -3}
                  fontSize="xs"
                >
                  {mark}
                </SliderMark>
              ))}
              <SliderTrack
                bgGradient="linear(to-r, #FF6B35, #FFB347, #FFFACD, #E0FFFF, #87CEEB, #6495ED)"
              >
                <SliderFilledTrack bg="transparent" />
              </SliderTrack>
              <SliderThumb borderColor="#212E40" boxSize={5} />
            </Slider>
          </Box>
          {/* Préréglages rapides */}
          <SimpleGrid columns={{ base: 3, md: 6 }} spacing={2}>
            {WB_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                size="sm"
                variant={wbKelvin === preset.kelvin ? "solid" : "outline"}
                colorScheme={wbKelvin === preset.kelvin ? "blue" : "gray"}
                onClick={() => setWbKelvin(preset.kelvin)}
                fontSize="xs"
                h="auto"
                py={2}
                flexDir="column"
              >
                <Text fontSize="lg">{preset.icon}</Text>
                <Text>{preset.name}</Text>
              </Button>
            ))}
          </SimpleGrid>
        </Box>

        {/* Résultat / Explication */}
        <Box bg="#EFF7FB" p={4} borderRadius="md">
          <VStack spacing={2} align="start">
            <Text fontWeight="medium" color="#212E40">
              Résultat
            </Text>
            {wbKelvin === sceneLight ? (
              <Text color="green.600">
                ✅ <strong>Couleurs neutres :</strong> La balance des blancs correspond
                à la lumière de la scène. Les blancs apparaissent blancs.
              </Text>
            ) : wbKelvin > sceneLight ? (
              <Text color="orange.600">
                🔶 <strong>Image plus chaude :</strong> La BB est réglée plus haut que
                la lumière réelle. L'appareil ajoute du orange/jaune car il "pense"
                compenser une lumière plus froide.
              </Text>
            ) : (
              <Text color="blue.600">
                🔷 <strong>Image plus froide :</strong> La BB est réglée plus bas que
                la lumière réelle. L'appareil ajoute du bleu car il "pense" compenser
                une lumière plus chaude.
              </Text>
            )}
          </VStack>
        </Box>

        {/* Échelle Kelvin */}
        <Box>
          <Text fontWeight="medium" fontSize="sm" mb={3}>
            Échelle des températures de couleur
          </Text>
          <Box
            h="40px"
            borderRadius="md"
            bgGradient="linear(to-r, #FF4500, #FF6B35, #FF8C00, #FFB347, #FFD700, #FFFACD, #F0F8FF, #E0FFFF, #B0E0E6, #87CEEB, #6495ED)"
            position="relative"
          >
            <Flex
              justify="space-between"
              position="absolute"
              bottom="-20px"
              left={0}
              right={0}
              fontSize="xs"
              color="gray.600"
            >
              <Text>1800K</Text>
              <Text>3200K</Text>
              <Text>5500K</Text>
              <Text>6500K</Text>
              <Text>10000K</Text>
            </Flex>
            <Flex
              justify="space-between"
              position="absolute"
              top="50%"
              transform="translateY(-50%)"
              left={2}
              right={2}
              fontSize="xs"
              color="white"
              textShadow="0 1px 2px rgba(0,0,0,0.5)"
            >
              <Text>Bougie</Text>
              <Text>Tungstène</Text>
              <Text>Soleil</Text>
              <Text>Nuageux</Text>
              <Text>Ciel bleu</Text>
            </Flex>
          </Box>
        </Box>

        {/* Info pédagogique */}
        <Box bg="gray.50" p={4} borderRadius="md" fontSize="sm" color="gray.600" mt={4}>
          <Text fontWeight="medium" mb={2}>
            Comprendre la balance des blancs
          </Text>
          <Text mb={2}>
            La <strong>balance des blancs</strong> permet de corriger la dominante de
            couleur causée par différentes sources de lumière, afin que les blancs
            apparaissent réellement blancs.
          </Text>
          <Text mb={2}>
            <strong>Température de couleur :</strong> Exprimée en Kelvin (K), elle va
            du chaud (orange, ~2000K) au froid (bleu, ~10000K).
          </Text>
          <Text>
            <strong>Astuce :</strong> En RAW, la balance des blancs peut être modifiée
            sans perte en post-traitement. En JPEG, elle est "fixée" à la prise de vue.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}

export default App;
