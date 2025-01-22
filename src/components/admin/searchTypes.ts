export type Category = "Matches"|"User" | "Attribute";

export type QueryModifier = {
  Matches: "";
  User: "owns" | "hasAccess";
  Attribute: "resourceAttribute";
};

export type QueryParameters = {
  matches: string;
  byUserName: string;
  resourceAttribute: "stale" | "shared";
};