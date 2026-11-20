import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { SearchField } from "../index.js";

function SearchExample() {
  const [value, setValue] = useState("");
  return (
    <SearchField
      id="search"
      label="Einstellungen durchsuchen"
      value={value}
      onChange={setValue}
    />
  );
}

it.each(["Knopf", "Escape"])("clears the search with %s and keeps the input focused", (method) => {
  render(<SearchExample />);
  const input = screen.getByRole("searchbox", { name: "Einstellungen durchsuchen" });
  expect(screen.queryByRole("button", { name: /Suche leeren/ })).toBeNull();
  fireEvent.change(input, { target: { value: "Sidebar" } });
  expect(input).toHaveValue("Sidebar");
  if (method === "Knopf") {
    fireEvent.click(screen.getByRole("button", { name: /Suche leeren/ }));
  } else {
    fireEvent.keyDown(input, { key: "Escape" });
  }
  expect(input).toHaveValue("");
  expect(input).toHaveFocus();
  expect(screen.queryByRole("button", { name: /Suche leeren/ })).toBeNull();
});

it("lets Escape through to the surrounding menu while the search is empty", () => {
  const onKeyDown = vi.fn();
  render(
    <div onKeyDown={onKeyDown}>
      <SearchExample />
    </div>,
  );
  fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" });
  expect(onKeyDown).toHaveBeenCalledOnce();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Test" } });
  fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" });
  expect(onKeyDown).toHaveBeenCalledOnce();
});

it("passes a class name to the wrapper", () => {
  const { container } = render(<SearchField id="s" label="Suche" value="" onChange={() => undefined} className="wide" />);
  expect(container.querySelector(".search-field")).toHaveClass("wide");
});
