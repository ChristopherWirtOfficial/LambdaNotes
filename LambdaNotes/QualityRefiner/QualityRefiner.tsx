import { FC, useRef, KeyboardEvent, useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import {
  VStack,
  Flex,
  Heading,
  Input,
  Button,
  List,
  ListItem,
  Box,
  Text,
  HStack,
  IconButton,
  Spinner,
  StackDivider,
} from '@chakra-ui/react';
import { atom } from 'jotai';
import { Answers, OpenAIKeyAtom, useGuesser } from './useGuesser';
import { CloseIcon, EditIcon } from '@chakra-ui/icons';

export type Quality = string;

import { atomWithStorage, createJSONStorage } from 'jotai/utils';

const storage = createJSONStorage(() => sessionStorage);
const qualitiesAtom = atomWithStorage<Quality[]>('qualities', [], storage);

// The guess atom will hold the AI guess
const guessAtom = atom<Answers | null>(null);

// The loading atom will hold the loading state
const loadingAtom = atom<boolean>(false);

const QualityRefiner: FC = () => {
  const [openAiKey, setOpenAiKey] = useAtom(OpenAIKeyAtom);

  // Set up state using Jotai atoms
  const [qualities, setQualities] = useAtom(qualitiesAtom);
  const [guess, setGuess] = useAtom(guessAtom);
  const [isLoading, setLoading] = useAtom(loadingAtom);

  // Set up local state for editing
  const [editing, setEditing] = useState<string | null>(null);
  const editingRef = useRef<HTMLInputElement | null>(null);

  const { askForGuess } = useGuesser();

  // Set up a ref for the input field
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Function to handle adding new qualities
  const addQuality = () => {
    if (inputRef.current?.value) {
      setQualities((oldQualities) => [...oldQualities, inputRef.current!.value]);
      inputRef.current.value = ''; // Reset the input field
    }
  };

  // Function to handle adding new qualities on 'Enter' key press
  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      addQuality();
    }
  };

  // Function to handle editing a quality
  const editQuality = (quality: Quality) => {
    setEditing(quality);
  };

  // Function to handle saving the edited quality
  const saveEdit = () => {
    if (editing && editingRef.current?.value) {
      setQualities((oldQualities) => oldQualities.map((q) => (q === editing ? editingRef.current!.value : q)));
      setEditing(null); // Reset the editing state
    }
  };

  // Function to handle deleting a quality
  const deleteQuality = (quality: Quality) => {
    setQualities((oldQualities) => oldQualities.filter((q) => q !== quality));
  };

  // Function to handle getting a guess from the AI
  const getGuess = useCallback(async () => {
    setLoading(true);
    // await for the askForAnswer to respond and then set the guess
    const aiGuess = await askForGuess(qualities);
    setGuess(aiGuess);
    setLoading(false);
  }, [askForGuess, qualities, setGuess, setLoading]);

  // Function to handle resetting the qualities
  const reset = () => {
    setQualities([]);
    setGuess(null);
  };

  useEffect(() => {
    // When the qualities change and they're not empty, make a guess
    if (qualities.length > 0) {
      getGuess();
    }
  }, [qualities, getGuess]);

  // Set up a ref for the OpenAI key input field
  const openAiKeyRef = useRef<HTMLInputElement | null>(null);

  // Function to handle setting OpenAI key
  const handleSetOpenAIKey = () => {
    if (openAiKeyRef.current?.value) {
      setOpenAiKey(openAiKeyRef.current.value);
    }
  };

  // Function to handle setting OpenAI key on 'Enter' key press
  const handleOpenAIKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSetOpenAIKey();
    }
  };

  return (
    <VStack bg="blackAlpha.800" color="whiteAlpha.800">
      <Flex w="100vw" minH="100vh" p={10} justifyContent="space-between" gap={8}>
        <VStack flex="1" bg="gray.700" p={6} borderRadius="lg" align="start" gap={6}>
          <Input
            ref={openAiKeyRef}
            placeholder="Enter your OpenAI Key"
            onKeyPress={handleOpenAIKeyPress}
            onBlur={handleSetOpenAIKey}
          />
          <Heading as="h2" size="lg" color="white">
            Add your qualities
          </Heading>
          <Input ref={inputRef} placeholder="Enter a quality" onKeyPress={handleKeyPress} />
          <HStack spacing={4}>
            <Button onClick={addQuality}>Add quality</Button>
            <Button onClick={reset} colorScheme="red">
              Reset
            </Button>
          </HStack>
          <List spacing={3}>
            {qualities.map((quality) => (
              <ListItem key={quality}>
                <HStack spacing={4}>
                  {editing === quality ? (
                    <Input ref={editingRef} defaultValue={quality} onBlur={saveEdit} autoFocus />
                  ) : (
                    <Text>{quality}</Text>
                  )}
                  <IconButton aria-label="Edit" icon={<EditIcon />} onClick={() => editQuality(quality)} />
                  <IconButton aria-label="Delete" icon={<CloseIcon />} onClick={() => deleteQuality(quality)} />
                </HStack>
              </ListItem>
            ))}
          </List>
          <Button onClick={getGuess}>Get AI guess</Button>
        </VStack>
        <Box flex="1" bg="gray.700" p={6} borderRadius="lg">
          <Heading as="h2" size="lg" color="white">
            AI's answers
          </Heading>
          {isLoading ? (
            <Spinner size="xl" />
          ) : (
            <VStack spacing={4} divider={<StackDivider />} align="start">
              <Box>
                <Text fontWeight="bold">Most Likely:</Text>
                <Text fontSize="sm">{guess?.mostLikely}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Best Guess:</Text>
                <Text fontSize="sm">{guess?.best}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Worst Possible Guess:</Text>
                <Text fontSize="sm">{guess?.worst}</Text>
              </Box>
            </VStack>
          )}
        </Box>
      </Flex>
    </VStack>
  );
};

export default QualityRefiner;
