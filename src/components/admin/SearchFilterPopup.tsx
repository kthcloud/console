import {
  Popper,
  Paper,
  ClickAwayListener,
  Typography,
  MenuItem,
  MenuList,
  Stack,
  Divider,
} from "@mui/material";
import { Category, QueryModifier } from "./searchTypes";

type SearchFilterPopupProps = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  category: Category;
  setCategory: (value: Category) => void;
  queryModifier: QueryModifier[Category];
  setQueryModifier: (value: QueryModifier[Category]) => void;
};

export default function SearchFilterPopup({
  anchorEl,
  onClose,
  category,
  setCategory,
  queryModifier,
  setQueryModifier,
}: SearchFilterPopupProps) {
  const isOpen = Boolean(anchorEl);

  // Category options
  const categoryOptions: Category[] = ["Matches", "User", "Attribute"];

  // Query modifier options based on category
  const queryModifierOptions: Record<Category, string[]> = {
    Matches: [],
    User: ["owns", "hasAccess"],
    Attribute: ["resourceAttribute"],
  };

  return (
    <Popper open={isOpen} anchorEl={anchorEl} placement="bottom-end">
      <ClickAwayListener onClickAway={onClose}>
        <Paper sx={{ p: 2, width: 300 }}>
          <Stack spacing={2}>
            {/* Category Selection */}
            <div>
              <Typography variant="subtitle1">Category</Typography>
              <MenuList>
                {categoryOptions.map((option) => (
                  <MenuItem
                    key={option}
                    selected={option === category}
                    onClick={() => setCategory(option)}
                  >
                    {option}
                  </MenuItem>
                ))}
              </MenuList>
            </div>
            <Divider />

            {/* Query Modifier Selection */}
            {(queryModifierOptions[category] || []).length > 0 && (
              <>
                <div>
                  <Typography variant="subtitle1">Query Modifier</Typography>
                  <MenuList>
                    {(queryModifierOptions[category] || []).map((option) => (
                      <MenuItem
                        key={option}
                        selected={option === queryModifier}
                        onClick={() =>
                          setQueryModifier(option as QueryModifier[Category])
                        }
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </MenuList>
                </div>
                <Divider />
              </>
            )}
          </Stack>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}
