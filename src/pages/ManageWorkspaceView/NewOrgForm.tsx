import { MetadataService } from "@/services";
import {
  Button,
  ButtonType,
  Input,
  SnackbarTimer,
  Text,
  TextColor,
  useSnackbar,
} from "@ginger-society/ginger-ui";
import { useState } from "react";

function toSlug(input: string): string {
  // Lowercase the input string
  let slug = input.toLowerCase();

  // Remove everything except alphabets a-z and spaces
  slug = slug.replace(/[^a-z\s]/g, " ");

  // Trim the string
  slug = slug.trim();

  // Replace single and multiple consecutive spaces with a hyphen
  slug = slug.replace(/\s+/g, "-");

  return slug;
}

const NewOrgForm = ({ onCancel }: { onCancel: () => void }) => {
  const [name, setName] = useState<string>();
  const [slug, setSlug] = useState<string>();
  const [errorTxt, setErrorTxt] = useState<string>();
  const { show } = useSnackbar();

  const handleCreate = async () => {
    if (!name) {
      setErrorTxt("Name is required");
      return;
    }
    try {
      const response = await MetadataService.metadataCreateOrganization({
        createOrganizationRequest: { name },
      });
      show("Workspace created successfully", SnackbarTimer.Medium);
      setName(undefined);
      onCancel();
    } catch (e) {
      setErrorTxt("Workspace ID already taken");
      console.log(e);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        flexDirection: "column",
      }}
    >
      <Input
        label="Friendly name"
        placeholder="Example : Acme Corp"
        onChange={(e) => {
          setErrorTxt(undefined);
          setSlug(toSlug(e.target.value));
          setName(e.target.value);
        }}
        value={name}
        // state="danger"
        // info="This username is already taken."
      />
      <Text>Slug : {slug}</Text>
      <Text color={TextColor.Danger}>{errorTxt}</Text>
      <div
        style={{ display: "flex", gap: "20px", flexDirection: "row-reverse" }}
      >
        <Button
          onClick={handleCreate}
          label="Create"
          type={ButtonType.Primary}
        ></Button>
        <Button label="Cancel" onClick={onCancel}></Button>
      </div>
    </div>
  );
};

export default NewOrgForm;
