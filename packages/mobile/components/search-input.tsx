import React, { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { SearchIcon } from "~/components/icons/search";
import { Colors } from "~/constants/colors";

interface SearchInputProps {
  onSearch: (query: string) => void;
  activeColor?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  activeColor = Colors["osmoverse"][800],
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.searchContainer,
        isFocused && { borderColor: activeColor },
      ]}
    >
      <SearchIcon />
      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        placeholderTextColor={Colors["osmoverse"][400]}
        onChangeText={onSearch}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors["osmoverse"][825],
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 4,
    flex: 1,
    borderWidth: 1,
    borderColor: "transparent",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 12,
  },
});
