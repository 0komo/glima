import * as collections from "@std/collections";
import { parseGir } from "@gi.ts/parser";
import { toList } from "./gleam.mjs";
import { None, Some } from "./gleam/option.mjs";
import { Notified, Async, Call, Forever } from "./glima/gir_parser.mjs";

const deepCopy = (a) => collections.deepMerge(a, {});
const asOption = (a) => a ? new Some(a) : new None();
const asOptionMap = (a, fn) => a ? new Some(fn(a)) : new None());
const asBool = (b) => b == "1";
const asBoolOption = (b) => nullish(b) ? new None() : new Some(asBool(b));
const asListOptionMap = (a, fn) =>
  nullish(a) ? new None() : new Some(toList(a.map(fn)));

// TODO: Parse the gir-types.ts and generate

export function parse(content) {
  return parseGir(content);
}

export function nullish(a) {
  return a == null || a == undefined;
}

export function fixGirInfoAttrsField(badGirInfoAttrs) {
  const girInfoAttrs = deepCopy(badGirInfoAttrs);

  ["introspectable", "deprecated", "version", "stability"].map((k) => {
    const v = girInfoAttrs[k];
    return typeof v == "boolean" ? asBoolOption(v) : asOption(v);
  });
  girInfoAttrs.deprecated_version = asOption(
    girInfoAttrs["deprecated-version"],
  );

  return girInfoAttrs;
}

export function fixGirDocElementField(badGirDoc) {
  const fixXmlField = ($) => {
    $.xml_space = asOption($["xml:space"]);
    $.xml_whitespace = asOption($["xml:whitespace"]);
  };
  const mergeSrcPosField = ($, b) => {
    const { filename, line, column } = $;
    b.filename = filename;
    b.line = line;
    b.column = asOption(column);
  };

  const girDoc = deepCopy(badGirDoc);

  girDoc.doc_version = girDoc["doc-version"]?.[0];
  if (girDoc.doc_version) {
    girDoc.doc_version = {
      xml_info: gir_doc.doc_version.$,
      version: girDoc.doc_version._,
    };
    fixXmlField(girDoc.doc_version.xml_info);
    girDoc.doc_version = new Some(girDoc.doc_version);
  } else {
    girDoc.doc_version = new None();
  }

  girDoc.doc_stability = girDoc["doc-stability"]?.[0];
  if (girDoc.doc_stability) {
    girDoc.doc_stability = {
      xml_info: gir_doc.doc_stability.$,
      stability: gir_doc.doc_stability._,
    };
    fixXmlField(girDoc.doc_stability.xml_info);
    girDoc.doc_stability = new Some(girDoc.doc_stability);
  } else {
    girDoc.doc_stability = new None();
  }

  girDoc.doc = girDoc.doc?.[0];
  if (girDoc.doc) {
    girDoc.doc = {
      xml_info: gir_doc.doc.$,
      srcpos: {},
      content: gir_doc.doc._,
    };
    fixXmlField(girDoc.doc.xml_info);
    mergeSrcPosField(girDoc.doc.$, girDoc.doc.srcpos);
    girDoc.doc = new Some(girDoc.doc);
  } else {
    girDoc.doc = new None();
  }

  girDoc.doc_deprecated = girDoc["doc-deprecated"]?.[0];
  if (girDoc.doc_deprecated) {
    girDoc.doc_deprecated = {
      xml_info: gir_doc.doc.$,
      reason: gir_doc.doc._,
    };
    fixXmlField(girDoc.doc_deprecated.xml_info);
    girDoc.doc_deprecated = new Some(girDoc.doc_deprecated);
  } else {
    girDoc.doc_deprecated = new None();
  }

  girDoc.srcpos = girDoc["source-position"]?.[0];
  if (girDoc.srcpos) {
    const srcpos = girDoc.srcpos.$;
    girDoc.srcpos = {};
    mergeSrcPosField(srcpos, girDoc.srcpos);
    girDoc.srcpos = new Some(girDoc.srcpos);
  } else {
    girDoc.srcpos = new None();
  }

  return girDoc;
}

export function fixGirTransferOwnershipField(badGirTransferOwnership) {
  const girTransferOwnership = deepCopy(badGirTransferOwnership);

  girTransferOwnership.transfer_ownership =
    girTransferOwnership["transfer-ownership"];

  return girTransferOwnership;
}

export function fixGirCallableAttrsField(badGirCallableAttrs) {
  const girCallableAttrs = deepCopy(badGirCallableAttrs);

  girCallableAttrs.c_identifier = asOption(girCallableAttrs["c:identifier"]);
  girCallableAttrs.shadowed_by = asOption(girCallableAttrs["shadowed-by"]);
  girCallableAttrs.moved_to = asOption(girCallableAttrs["moved-to"]);
  girCallableAttrs.glib_async_func = asOption(
    girCallableAttrs["glib:async-func"],
  );
  girCallableAttrs.glib_sync_func = asOption(
    girCallableAttrs["glib:sync-func"],
  );
  girCallableAttrs.glib_finish_func = asOption(
    girCallableAttrs["glib:finish-func"],
  );

  return girCallableAttrs;
}

export function fixGirAnyTypeField(badGirAnyType) {
  const girAnyType = deepCopy(badGirAnyType);

  girAnyType.array = asListOptionMap(girAnyType.array, fixGirArrayTypeField);
  girAnyType.type = asListOptionMap(girAnyType.type, fixGirTypeField);

  return girAnyType;
}

export function fixGirModuleField(badGirModule) {
  const girModule = deepCopy(badGirModule);

  girModule.package_name = girModule.packageName;
  girModule.import_name = girModule.importName;
  girModule.import_path = girModule.importPath;

  return girModule;
}

export function fixGirCIncludeField(badGirCInclude) {
  const girCInclude = deepCopy(badGirCInclude);

  girCInclude.name = girCInclude.$.name;

  return girCInclude;
}

export function fixGirIncludeField(badGirInclude) {
  const girInclude = deepCopy(badGirInclude);

  girInclude.name = girInclude.$.name;
  girInclude.version = asOption(girInclude.$.version);

  return girInclude;
}

export function fixGirPackageField(badGirPackage) {
  const girPackage = deepCopy(badGirPackage);

  girPackage.name = girPackage.$.name;

  return girPackage;
}

export function fixGirDocFormatField(badGirDocFormat) {
  const girDocFormat = deepCopy(badGirDocFormat);

  girDocFormat.name = girDocFormat.$.name;

  return girDocFormat;
}

export function fixGirAnnotationField(badGirAnnotation) {
  const girAnnotation = deepCopy(badGirAnnotation);

  girAnnotation.name = girAnnotation.$.name;
  girAnnotation.value = girAnnotation.$.value;

  return girAnnotation;
}

export function fixGirImplementsField(badGirImplements) {
  const girImplements = deepCopy(badGirImplements);

  girImplements.gir_info_attrs = fixGirInfoAttrsField(girImplements);
  girImplements.name = girImplements.$.name;

  return girImplements;
}

export function fixGirPrerequisiteField(badGirPrerequisite) {
  const girPrerequisite = deepCopy(badGirPrerequisite);

  girPrerequisite.name = girPrerequisite.$.name;

  return girPrerequisite;
}

export function fixGirVarArgsField(badGirVarArgs) {
  return fixGirInfoAttrsField(deepCopy(badGirVarArgs).$);
}

export function fixGirTypeField(badGirType) {
  const girType = deepCopy(badGirType);

  girType.gir_doc = fixGirDocElementField(girType);
  girType.gir_info_attrs = fixGirInfoAttrsField(girType.$);
  girType.name = asOption(girType.$.name);
  girType.c_type = asOption(girType.$["c:type"]);
  girType.introspectable = asOption(girType.$.introspectable);
  girType.array = asListOptionMap(girType.array, fixGirArrayTypeField);
  girType.type = asListOptionMap(girType.type, fixGirTypeField);

  return girType;
}

export function fixGirArrayTypeField(badGirArrayType) {
  const girArrayType = deepCopy(badGirArrayType);

  girArrayType.gir_info_attrs = fixGirInfoAttrsField(girArrayType.$);
  girArrayType.name = asOption(girArrayType.$.name);
  girArrayType.c_type = asOption(girArrayType.$["c:type"]);
  girArrayType.introspectable = asBoolOption(girArrayType.$.introspectable);
  girArrayType.zero_terminated = asBoolOption(
    girArrayType.$["zero-terminated"],
  );
  girArrayType.fixed_size = asOption(girArrayType.$["fixed-size"]);
  girArrayType.length = asOption(girArrayType.$.length);
  girArrayType.array = asListOptionMap(
    girArrayType.array,
    fixGirArrayTypeField,
  );
  girArrayType.type = asListOptionMap(girArrayType.type, fixGirTypeField);

  return girArrayType;
}

export function fixGirCallableParamElementField(badObj) {
  const scopeEnum = (scope) => {
    switch (scope) {
        case "notified":
          return new Notified();
        case "async":
          return new Async();
        case "call":
          return new Call();
        case "forever":
          return new Forever();
    }
  };

  const obj = deepCopy(badObj);

  obj.$ = fixGirTransferOwnershipField(obj.$);
  obj.name = asOption(obj.$.name);
  obj.nullable = asBoolOption(obj.$.nullable);
  obj.scope = asOptionMap(obj.$.scope, scopeEnum);

  return obj
}
