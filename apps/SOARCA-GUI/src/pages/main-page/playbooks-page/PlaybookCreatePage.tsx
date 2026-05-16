import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, FileJson, Files, Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

import { createPlaybook } from "@/api/playbooks";
import { formatErrorForToast } from "@/api/utils";
import {
  Button,
  CardBody,
  CardContainer,
  CardHeader,
  CardTitle,
  Icon,
  Link,
  Spacer,
  ThemeSize,
  ThemeVariant,
} from "@/components";
import { Playbook } from "@/types";
import { PATHS } from "@/utils";
import {
  NgSoarCreatedPlaybookHandoff,
  NgSoarCreateInRoasterPrompt,
} from "@/ng-soar/playbooks/create/RoasterCreateHandoff";

import CodeEditor from "@/components/CodeEditor";
import FileDrop from "@/components/FileDrop";
import {
  BulkImportDropZone,
  BulkImportItem,
  BulkImportList,
  BulkImportMeta,
  BulkImportPanel,
  MethodButton,
  MethodSelector,
} from "./PlaybookCreatePage.styles";
import { ActionButtons, ErrorMessage } from "./shared.styles";
import { validatePlaybookJson } from "./utils";

type CreationMethod = "upload" | "bulk" | "editor";

type BulkPlaybookFile = {
  filename: string;
  playbook?: Playbook;
  error?: string;
};

export const PlaybookCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const bulkInputRef = useRef<HTMLInputElement | null>(null);
  const [method, setMethod] = useState<CreationMethod>("upload");
  const [jsonContent, setJsonContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [createdPlaybook, setCreatedPlaybook] = useState<Playbook | undefined>();
  const [bulkFiles, setBulkFiles] = useState<BulkPlaybookFile[]>([]);
  const [bulkCreatedPlaybooks, setBulkCreatedPlaybooks] = useState<Playbook[]>([]);

  const createMutation = useMutation({
    mutationFn: (playbook: Playbook) => createPlaybook(playbook),
    onSuccess: (playbook) => {
      toast.success("Playbook created successfully!");
      setCreatedPlaybook(playbook);
    },
    onError: (err: Error) => {
      const errorMessage = err.message || "Failed to create playbook";
      setError(errorMessage);
      toast.error(formatErrorForToast(err, "Failed to create playbook"));
    },
  });
  const bulkCreateMutation = useMutation({
    mutationFn: async (playbooks: Playbook[]) => {
      const results = await Promise.allSettled(
        playbooks.map((playbook) => createPlaybook(playbook)),
      );
      const created = results
        .filter((result): result is PromiseFulfilledResult<Playbook> =>
          result.status === "fulfilled",
        )
        .map((result) => result.value);
      const failed = results.filter((result) => result.status === "rejected");

      return { created, failed };
    },
    onSuccess: ({ created, failed }) => {
      setBulkCreatedPlaybooks(created);

      if (created.length > 0) {
        toast.success(`Imported ${created.length} playbook${created.length === 1 ? "" : "s"}.`);
      }

      if (failed.length > 0) {
        toast.error(`${failed.length} playbook${failed.length === 1 ? "" : "s"} failed to import.`);
      }
    },
    onError: (err: Error) => {
      toast.error(formatErrorForToast(err, "Failed to import playbooks"));
    },
  });
  const isSubmitting = createMutation.isPending || bulkCreateMutation.isPending;

  const handleSubmit = () => {
    if (method === "bulk") {
      const validPlaybooks = bulkFiles
        .map((file) => file.playbook)
        .filter((playbook): playbook is Playbook => Boolean(playbook));

      if (validPlaybooks.length === 0) {
        setError("Select at least one valid CACAO playbook JSON file.");
        return;
      }

      setError("");
      setCreatedPlaybook(undefined);
      setBulkCreatedPlaybooks([]);
      bulkCreateMutation.mutate(validPlaybooks);
      return;
    }

    const validation = validatePlaybookJson(jsonContent);

    if (!validation.valid || !validation.data) {
      setError(validation.error || "Invalid JSON");
      return;
    }

    setError("");
    setCreatedPlaybook(undefined);
    createMutation.mutate(validation.data);
  };

  const handleMethodChange = (newMethod: CreationMethod) => {
    setMethod(newMethod);
    setJsonContent("");
    setFileName("");
    setError("");
    setCreatedPlaybook(undefined);
    setBulkFiles([]);
    setBulkCreatedPlaybooks([]);
  };

  const handleBulkFiles = async (files: FileList | File[]) => {
    const jsonFiles = Array.from(files).filter((file) => file.name.endsWith(".json"));
    const parsedFiles = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await file.text();
        const validation = validatePlaybookJson(content);

        return {
          filename: file.name,
          playbook: validation.valid ? validation.data : undefined,
          error: validation.valid ? undefined : validation.error || "Invalid JSON",
        };
      }),
    );

    setBulkFiles(parsedFiles);
    setBulkCreatedPlaybooks([]);
    setError(
      parsedFiles.length === 0
        ? "Select one or more .json files."
        : parsedFiles.some((file) => file.error)
          ? "One or more files are invalid and will be skipped."
          : "",
    );
  };

  const openRoaster = (playbookId?: string) => {
    const path = playbookId
      ? PATHS.ROASTER.PLAYBOOK.replace(":playbookId", playbookId)
      : PATHS.ROASTER.BASE;

    navigate(path);
  };

  const validBulkCount = bulkFiles.filter((file) => file.playbook).length;
  const canSubmit =
    method === "bulk"
      ? validBulkCount > 0 && !bulkCreateMutation.isPending
      : jsonContent.trim() && !error && !createMutation.isPending;

  return (
    <Spacer $direction="vertical" $gap="lg" $align="start">
      <Link $to={PATHS.PLAYBOOKS.BASE}>
        <Icon $icon={ArrowLeft} />
        Back to playbooks
      </Link>

      <CardContainer>
        <CardHeader>
          <CardTitle>Create new playbook</CardTitle>
        </CardHeader>
        <CardBody>
          <NgSoarCreateInRoasterPrompt onOpenRoaster={() => openRoaster()} />

          <MethodSelector>
            <MethodButton
              $active={method === "upload"}
              onClick={() => handleMethodChange("upload")}
              disabled={isSubmitting}
            >
              <Icon $icon={Upload} $size={ThemeSize.Medium} />
              Upload JSON file
            </MethodButton>
            <MethodButton
              $active={method === "bulk"}
              onClick={() => handleMethodChange("bulk")}
              disabled={isSubmitting}
            >
              <Icon $icon={Files} $size={ThemeSize.Medium} />
              Bulk import
            </MethodButton>
            <MethodButton
              $active={method === "editor"}
              onClick={() => handleMethodChange("editor")}
              disabled={isSubmitting}
            >
              <Icon $icon={FileJson} $size={ThemeSize.Medium} />
              JSON Editor
            </MethodButton>
          </MethodSelector>

          {method === "upload" ? (
            <>
              <FileDrop
                $fileName={fileName}
                $onChange={(content, filename) => {
                  setFileName(filename || "");
                  setJsonContent(content);
                  setError("");
                  if (content.trim()) {
                    const validation = validatePlaybookJson(content);
                    if (!validation.valid)
                      setError(validation.error || "Invalid JSON");
                  }
                }}
                $onRemove={() => {
                  setFileName("");
                  setJsonContent("");
                  setError("");
                }}
                $accept=".json"
                $disabled={isSubmitting}
                $error={error}
              />
            </>
          ) : method === "bulk" ? (
            <BulkImportPanel>
              <input
                ref={bulkInputRef}
                type="file"
                accept=".json"
                multiple
                onChange={(event) => {
                  if (event.target.files) {
                    handleBulkFiles(event.target.files);
                  }
                }}
                style={{ display: "none" }}
                disabled={bulkCreateMutation.isPending}
              />
              <BulkImportDropZone
                type="button"
                disabled={bulkCreateMutation.isPending}
                onClick={() => bulkInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  handleBulkFiles(event.dataTransfer.files);
                }}
              >
                <Icon $icon={Files} $size={ThemeSize.ExtraLarge} />
                Select or drag multiple CACAO JSON playbooks
              </BulkImportDropZone>

              {bulkFiles.length > 0 && (
                <BulkImportList>
                  {bulkFiles.map((file) => (
                    <BulkImportItem key={file.filename} $hasError={Boolean(file.error)}>
                      <span>{file.filename}</span>
                      <BulkImportMeta>
                        {file.error ?? file.playbook?.name ?? file.playbook?.id}
                      </BulkImportMeta>
                    </BulkImportItem>
                  ))}
                </BulkImportList>
              )}
            </BulkImportPanel>
          ) : (
            <CodeEditor
              $value={jsonContent}
              $onChange={(v) => {
                setJsonContent(v);
                setError("");
                if (v.trim()) {
                  const validation = validatePlaybookJson(v);
                  if (!validation.valid)
                    setError(validation.error || "Invalid JSON");
                }
              }}
              $placeholder="Paste or write your CACAO playbook JSON here..."
              $disabled={isSubmitting}
              $hasError={!!error}
              $minHeight="400px"
            />
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}

          {createdPlaybook && (
            <NgSoarCreatedPlaybookHandoff
              playbook={createdPlaybook}
              onBackToPlaybooks={() => navigate(PATHS.PLAYBOOKS.BASE)}
              onOpenRoaster={openRoaster}
            />
          )}

          {bulkCreatedPlaybooks.length > 0 && (
            <BulkImportPanel>
              <BulkImportMeta>
                Imported {bulkCreatedPlaybooks.length} playbook
                {bulkCreatedPlaybooks.length === 1 ? "" : "s"} into SOARCA.
              </BulkImportMeta>
              <Button
                $variant={ThemeVariant.Primary}
                $ghost
                onClick={() => navigate(PATHS.PLAYBOOKS.BASE)}
              >
                Back to playbooks
              </Button>
            </BulkImportPanel>
          )}

          <ActionButtons>
            <Button
              $variant={ThemeVariant.Primary}
              $ghost
              onClick={() => navigate(PATHS.PLAYBOOKS.BASE)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              $variant={ThemeVariant.Success}
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {method === "bulk" ? `Import ${validBulkCount || ""} playbooks` : "Create playbook"}
            </Button>
          </ActionButtons>
        </CardBody>
      </CardContainer>
    </Spacer>
  );
};
