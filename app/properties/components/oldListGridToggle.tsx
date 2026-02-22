import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export  function oldListGridToggle(isGridView:boolean, setIsGridView: (value: boolean) => void) {
  return (
      <View className="flex-row px-4 py-2 bg-white">
        <TouchableOpacity
          className={`flex-1 border border-gray-200 rounded-lg py-2 items-center mx-1 ${!isGridView ? 'bg-blue-500' : ''}`}
          onPress={() => setIsGridView(false)}
        >
          <Text className={`font-bold ${!isGridView ? 'text-white' : 'text-blue-500'}`}>List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 border border-gray-200 rounded-lg py-2 items-center mx-1 ${isGridView ? 'bg-blue-500' : ''}`}
          onPress={() => setIsGridView(true)}
        >
          <Text className={`font-bold ${isGridView ? 'text-white' : 'text-blue-500'}`}>Grid</Text>
        </TouchableOpacity>
      </View>
  )
}

export default oldListGridToggle