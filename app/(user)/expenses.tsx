import React, { useState } from 'react'
import { FlatList, ScrollView, Text, View } from 'react-native'

const ExpensesScreen = () => {
  const [expenses, setExpenses] = useState([
    { id: '1', service: 'Cambio de aceite', amount: '$500', date: '10 Feb, 2026', status: 'Pagado' },
    { id: '2', service: 'Revisión general', amount: '$800', date: '05 Feb, 2026', status: 'Pagado' },
    { id: '3', service: 'Alineación', amount: '$1,200', date: '01 Feb, 2026', status: 'Pagado' },
    { id: '4', service: 'Frenos', amount: '$2,000', date: '28 Ene, 2026', status: 'Pagado' },
  ])

  const totalExpenses = expenses.reduce((sum, expense) => {
    const amount = parseInt(expense.amount.replace(/\$/g, '').replace(/,/g, ''))
    return sum + amount
  }, 0)

  const renderExpense = ({ item }: any) => (
    <View className="bg-gray-100 p-4 rounded-lg mb-3 flex-row items-center justify-between">
      <View>
        <Text className="text-gray-800 font-semibold mb-1">{item.service}</Text>
        <Text className="text-sm text-gray-600">{item.date}</Text>
      </View>
      <View className="items-end">
        <Text className="text-lg font-bold text-red-600">{item.amount}</Text>
        <View className="bg-green-200 px-2 py-1 rounded mt-1">
          <Text className="text-xs text-green-800">{item.status}</Text>
        </View>
      </View>
    </View>
  )

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <View className="bg-blue-50 p-4 rounded-lg mb-6">
        <Text className="text-gray-700 mb-2">Total gastado</Text>
        <Text className="text-3xl font-bold text-blue-600">${totalExpenses.toLocaleString()}</Text>
      </View>

      <Text className="text-lg font-bold text-gray-800 mb-4">Historial de gastos</Text>

      <FlatList
        data={expenses}
        renderItem={renderExpense}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </ScrollView>
  )
}

export default ExpensesScreen
