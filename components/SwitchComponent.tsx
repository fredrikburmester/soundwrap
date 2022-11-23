import React, { useState, } from "react"
import { Switch } from "react-native"

interface Props {
  value: boolean
  onValueChange: (value: boolean) => void
}

export const SwitchComponent: React.FC<Props> = ({ value, onValueChange }) => {

  return (
    <Switch
      thumbColor={value ? "6DDC5F" : "white"}
      ios_backgroundColor="#DDDDDD"
      onValueChange={onValueChange}
      value={value}
    />
  )
}