import { useContext } from "solid-js";
import { QueryContext, onRecordEdit } from "@/query/store.js";
import { ProxyContext } from "@/proxy/store.js";
import { Spoiler, Confirmation } from "@/layout/components/index.js";
import { ProfileField, ProfileValue } from "../index.js";

export function ProfileRecord(props) {
  const { store: queryStore } = useContext(QueryContext);
  const { store: proxyStore } = useContext(ProxyContext);

  const leaves = () => {
    if (
      queryStore.schema === undefined ||
      queryStore.schema[props.record._] === undefined
    )
      return [];

    return queryStore.schema[props.record._].leaves;
  };

  const isRemote = () => {
    if (proxyStore.mind === undefined) return false;

    return proxyStore.mind.mind === "root" && props.record._ === "origin_url";
  };

  function access(field) {
    return props.record !== undefined ? props.record[field] : undefined;
  }

  return (
    <>
      <ProfileValue
        value={access(access("_"))}
        branch={access("_")}
        path={[...props.path, access("_")]}
      />

      <Spoiler
        index={`${props.index}-spoilerfield`}
        title={"with"}
        isOpenDefault={props.isOpenDefault}
      >
        <Spoiler index={`${props.index}-spoileradd`} title={"add"}>
          <Index each={leaves()} fallback={<>...</>}>
            {(leaf, index) => {
              const addNew = () =>
                onRecordEdit(
                  [...props.path, leaf()],
                  [
                    {
                      _: leaf(),
                      [leaf()]: "",
                    },
                  ],
                );

              const addAnother = () =>
                onRecordEdit([...props.path, leaf(), access(leaf()).length], {
                  _: leaf(),
                  [leaf()]: "",
                });

              return (
                <button
                  className={"profileAddNew"}
                  onClick={() =>
                    props.record.hasOwnProperty(leaf())
                      ? addAnother()
                      : addNew()
                  }
                >
                  {leaf()}{" "}
                </button>
              );
            }}
          </Index>
        </Spoiler>

        <Index
          each={leaves()}
          fallback={<span>record but branch is twig</span>}
        >
          {(leaf, index) => (
            <ProfileField
              index={`${props.index}-${leaf()}`}
              branch={leaf()}
              items={access(leaf()) ?? []}
              path={[...props.path, leaf()]}
            />
          )}
        </Index>
      </Spoiler>
    </>
  );
}
