import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, TextInput, View } from 'react-native';

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isListView: boolean;
  setListView: (isListView: boolean) => void;
}

export function SearchAndFilters({ searchQuery, setSearchQuery, isListView, setListView }: SearchAndFiltersProps) {
  return (
       <View className = "flex-row px-4 py-3 bg-white">
          <TextInput
          className='flex-1 border border-gray-200 px-3 py-2 mr-2 rounded-lg'
          placeholder='Search'
          value={searchQuery}
          onChangeText={setSearchQuery}/>
          <Pressable className="h-12 w-12 items-center justify-center rounded-full">
            <Feather name="filter"color="blue" size={20}/>
          </Pressable>

          {/* To Do: Add Toggle for Grid/List View */}
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-full"
            onPress={() => setListView(!isListView)}
          >
            <Feather name={!isListView? "list" : "grid"}color="blue" size={20}/>
          </Pressable>

       </View>
  )
}
export default SearchAndFilters
