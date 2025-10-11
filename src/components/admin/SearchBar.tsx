import React, { useState } from "react";
import {
  TextField,
  InputAdornment,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchFilterPopup from "./SearchFilterPopup";
import { Search, Sort } from "@mui/icons-material";
import { Category, QueryModifier } from "./searchTypes";

type SearchBarProps = {
  searchText?: string;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  category?: Category;
  queryModifier?: QueryModifier[Category];
  setCategory?: (value: Category) => void;
  setQueryModifier?: (value: QueryModifier[Category]) => void;
  onSearch: () => void;
};

const SearchBar: React.FC<SearchBarProps> = ({
  searchText = "Search",
  searchQuery,
  setSearchQuery,
  category,
  queryModifier,
  setCategory,
  setQueryModifier,
  onSearch,
}) => {
  const [popupAnchor, setPopupAnchor] = useState<HTMLElement | null>(null);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setPopupAnchor(popupAnchor ? null : event.currentTarget); // Toggle popup
  };

  const handleClosePopup = () => {
    setPopupAnchor(null);
  };

  const renderFilter =
    category != undefined &&
    setCategory != undefined &&
    queryModifier != undefined &&
    setQueryModifier != undefined;

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label={searchText}
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {renderFilter && (
                  <Tooltip title={"Filter query"}>
                    <IconButton color="primary" onClick={handleFilterClick}>
                      <Sort />
                    </IconButton>
                  </Tooltip>
                )}
                <IconButton color="primary" onClick={onSearch}>
                  <Search />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      {renderFilter && (
        <SearchFilterPopup
          anchorEl={popupAnchor}
          onClose={handleClosePopup}
          category={category}
          setCategory={setCategory}
          queryModifier={queryModifier}
          setQueryModifier={setQueryModifier}
        />
      )}
    </>
  );
};

export default SearchBar;
